// Google Safe Browsing v5 URL lookup (free for non-commercial use):
// https://developers.google.com/safe-browsing/reference/rest/v5alpha1/urls/search
//
// The API only answers in protobuf, so the reply is decoded by hand:
//   SearchUrlsResponse { repeated ThreatUrl threats = 1; Duration cache_duration = 2; }
//   ThreatUrl          { string url = 1; repeated ThreatType threat_types = 2; }
// A clean URL comes back without any field 1.

const ENDPOINT = 'https://safebrowsing.googleapis.com/v5alpha1/urls:search';
const TIMEOUT_MS = 3000;
const BATCH_TIMEOUT_MS = 5000;
const MAX_URLS_PER_CALL = 50; // the API's limit

const THREAT_TYPES: Record<number, string> = {
  1: 'MALWARE',
  2: 'SOCIAL_ENGINEERING',
  3: 'UNWANTED_SOFTWARE',
  4: 'POTENTIALLY_HARMFUL_APPLICATION',
};

export const UNSAFE_URL_MESSAGE =
  'Google Safe Browsing reports this link as unsafe.';

export type SafetyVerdict =
  | { verdict: 'safe' }
  | { verdict: 'unsafe'; threats: string[] }
  | { verdict: 'unknown'; reason: string };

/** Never throws: any failure (no key, timeout, bad reply) is 'unknown'. */
export async function checkUrlSafety(url: string): Promise<SafetyVerdict> {
  return toVerdict(await search([url], TIMEOUT_MS));
}

/**
 * For the weekly re-check of every link: up to 50 URLs per call, and a failed
 * call is tried again after each of `retryDelaysMs`. Google reports a hit in
 * its own canonical form ("host/path"), not as the URL sent, so a call with a
 * hit is repeated one URL at a time to see which URLs it was. Never throws.
 *
 * All calls go out at once: even if Google times out on every try, this takes
 * about 40 s, within the cron route's 60 s limit on Vercel Hobby.
 */
export async function checkUrlsSafety(
  urls: string[],
  retryDelaysMs = [1000, 3000],
): Promise<Map<string, SafetyVerdict>> {
  const verdicts = new Map<string, SafetyVerdict>();
  const unique = Array.from(new Set(urls));
  const searchWithRetries = (batch: string[]) =>
    withRetries(() => search(batch, BATCH_TIMEOUT_MS), retryDelaysMs);

  const batches: string[][] = [];
  for (let i = 0; i < unique.length; i += MAX_URLS_PER_CALL) {
    batches.push(unique.slice(i, i + MAX_URLS_PER_CALL));
  }

  await Promise.all(
    batches.map(async (batch) => {
      const result = await searchWithRetries(batch);

      if (!result.ok || result.threats.length === 0 || batch.length === 1) {
        for (const url of batch) verdicts.set(url, toVerdict(result));
        return;
      }
      const single = await Promise.all(
        batch.map(async (url) => toVerdict(await searchWithRetries([url]))),
      );
      batch.forEach((url, j) => verdicts.set(url, single[j]));
    }),
  );
  return verdicts;
}

type SearchResult =
  | { ok: true; threats: string[][] }
  | { ok: false; reason: string };

function toVerdict(result: SearchResult): SafetyVerdict {
  if (!result.ok) return { verdict: 'unknown', reason: result.reason };
  if (result.threats.length === 0) return { verdict: 'safe' };
  return {
    verdict: 'unsafe',
    threats: Array.from(new Set(result.threats.flat())),
  };
}

async function search(
  urls: string[],
  timeoutMs: number,
): Promise<SearchResult> {
  const key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!key) return { ok: false, reason: 'no API key' };

  try {
    const query = new URLSearchParams({ key });
    for (const url of urls) query.append('urls', url);
    const res = await fetch(`${ENDPOINT}?${query}`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

    return {
      ok: true,
      threats: readThreats(new Uint8Array(await res.arrayBuffer())),
    };
  } catch (err) {
    const reason =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return { ok: false, reason: reason.replaceAll(key, '***') };
  }
}

async function withRetries(
  attempt: () => Promise<SearchResult>,
  delaysMs: number[],
): Promise<SearchResult> {
  let result = await attempt();
  for (const delay of delaysMs) {
    if (result.ok || result.reason === 'no API key') break;
    await new Promise((resolve) => setTimeout(resolve, delay));
    result = await attempt();
  }
  return result;
}

/** One list of threat type names per ThreatUrl in a SearchUrlsResponse. */
function readThreats(reply: Uint8Array): string[][] {
  return readFields(reply)
    .filter((field) => field.num === 1 && field.value instanceof Uint8Array)
    .map((threat) =>
      readFields(threat.value as Uint8Array)
        .filter((field) => field.num === 2)
        // repeated enums are usually packed (bytes of varints), else one varint
        .flatMap((field) =>
          field.value instanceof Uint8Array
            ? readPackedVarints(field.value)
            : [field.value],
        )
        .map((type) => THREAT_TYPES[type] ?? `THREAT_${type}`),
    );
}

// ---------------------------------------------------------------------------
// Minimal protobuf reader: varint and length-delimited fields; fixed-size ones
// are skipped. Throws on truncated input.
// ---------------------------------------------------------------------------
type Field = { num: number; value: number | Uint8Array };

function readVarint(buf: Uint8Array, pos: number): [number, number] {
  let value = 0;
  for (let shift = 0; ; shift += 7) {
    if (pos >= buf.length || shift > 63) throw new Error('bad protobuf varint');
    const byte = buf[pos++];
    value += (byte & 0x7f) * 2 ** shift;
    if (byte < 0x80) return [value, pos];
  }
}

function readFields(buf: Uint8Array): Field[] {
  const fields: Field[] = [];
  let pos = 0;
  while (pos < buf.length) {
    let tag: number, n: number;
    [tag, pos] = readVarint(buf, pos);
    const num = Math.floor(tag / 8);
    switch (tag % 8) {
      case 0:
        [n, pos] = readVarint(buf, pos);
        fields.push({ num, value: n });
        break;
      case 1:
        pos += 8;
        break;
      case 2:
        [n, pos] = readVarint(buf, pos);
        if (pos + n > buf.length) throw new Error('truncated protobuf field');
        fields.push({ num, value: buf.subarray(pos, pos + n) });
        pos += n;
        break;
      case 5:
        pos += 4;
        break;
      default:
        throw new Error(`unsupported protobuf wire type ${tag % 8}`);
    }
  }
  if (pos > buf.length) throw new Error('truncated protobuf');
  return fields;
}

function readPackedVarints(buf: Uint8Array): number[] {
  const values: number[] = [];
  for (let pos = 0, n: number; pos < buf.length; values.push(n)) {
    [n, pos] = readVarint(buf, pos);
  }
  return values;
}
