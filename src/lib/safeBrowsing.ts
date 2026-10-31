// Google Safe Browsing v5 URL lookup (free for non-commercial use):
// https://developers.google.com/safe-browsing/reference/rest/v5alpha1/urls/search
//
// The API only answers in protobuf, so the reply is decoded by hand:
//   SearchUrlsResponse { repeated ThreatUrl threats = 1; Duration cache_duration = 2; }
//   ThreatUrl          { string url = 1; repeated ThreatType threat_types = 2; }
// A clean URL comes back without any field 1.

const ENDPOINT = 'https://safebrowsing.googleapis.com/v5alpha1/urls:search';
const TIMEOUT_MS = 3000;

const THREAT_TYPES: Record<number, string> = {
  1: 'MALWARE',
  2: 'SOCIAL_ENGINEERING',
  3: 'UNWANTED_SOFTWARE',
  4: 'POTENTIALLY_HARMFUL_APPLICATION',
};

export type SafetyVerdict =
  | { verdict: 'safe' }
  | { verdict: 'unsafe'; threats: string[] }
  | { verdict: 'unknown'; reason: string };

/** Never throws: any failure (no key, timeout, bad reply) is 'unknown'. */
export async function checkUrlSafety(url: string): Promise<SafetyVerdict> {
  const key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!key) return { verdict: 'unknown', reason: 'no API key' };

  try {
    const query = new URLSearchParams({ key, urls: url });
    const res = await fetch(`${ENDPOINT}?${query}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { verdict: 'unknown', reason: `HTTP ${res.status}` };

    const threats = readThreats(new Uint8Array(await res.arrayBuffer()));
    if (threats.length === 0) return { verdict: 'safe' };
    return { verdict: 'unsafe', threats: Array.from(new Set(threats.flat())) };
  } catch (err) {
    const reason =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return { verdict: 'unknown', reason: reason.replaceAll(key, '***') };
  }
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
