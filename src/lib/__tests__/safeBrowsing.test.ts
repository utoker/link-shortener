import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkUrlSafety } from '../safeBrowsing';

// Tiny protobuf encoder for test replies (lengths stay below 128).
const field = (num: number, bytes: number[]) => [
  (num << 3) | 2,
  bytes.length,
  ...bytes,
];
const text = (s: string) => Array.from(new TextEncoder().encode(s));
const threatUrl = (url: string, packedTypes: number[]) =>
  field(1, [...field(1, text(url)), ...field(2, packedTypes)]);
const CACHE_300S = field(2, [0x08, 0xac, 0x02]); // cacheDuration { seconds: 300 }

const reply = (bytes: number[], status = 200) =>
  new Response(new Uint8Array(bytes), {
    status,
    headers: { 'content-type': 'application/x-protobuf' },
  });

describe('checkUrlSafety', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('GOOGLE_SAFE_BROWSING_API_KEY', 'test-key');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('should call urls:search with the key and the URL', async () => {
    fetchMock.mockResolvedValue(reply(CACHE_300S));

    await checkUrlSafety('https://example.com/a?b=c&d');

    const requested = new URL(fetchMock.mock.calls[0][0]);
    expect(requested.origin + requested.pathname).toBe(
      'https://safebrowsing.googleapis.com/v5alpha1/urls:search',
    );
    expect(requested.searchParams.get('key')).toBe('test-key');
    expect(requested.searchParams.getAll('urls')).toEqual([
      'https://example.com/a?b=c&d',
    ]);
  });

  it('should report a URL without threats as safe', async () => {
    fetchMock.mockResolvedValue(reply(CACHE_300S));
    expect(await checkUrlSafety('https://example.com/')).toEqual({
      verdict: 'safe',
    });
  });

  it('should report a phishing URL as unsafe', async () => {
    fetchMock.mockResolvedValue(
      reply([...threatUrl('bad.example/', [2]), ...CACHE_300S]),
    );
    expect(await checkUrlSafety('https://bad.example/')).toEqual({
      verdict: 'unsafe',
      threats: ['SOCIAL_ENGINEERING'],
    });
  });

  it('should collect the types of every threat once', async () => {
    fetchMock.mockResolvedValue(
      reply([
        ...threatUrl('bad.example/', [1, 4]),
        ...threatUrl('bad.example/x', [1]),
        ...CACHE_300S,
      ]),
    );
    expect(await checkUrlSafety('https://bad.example/x')).toEqual({
      verdict: 'unsafe',
      threats: ['MALWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
    });
  });

  it('should read an unpacked threat type too', async () => {
    // ThreatUrl { url = 1; threat_types = 2 as a plain varint 3 }
    fetchMock.mockResolvedValue(
      reply(field(1, [...field(1, text('bad.example/')), 0x10, 0x03])),
    );
    expect(await checkUrlSafety('https://bad.example/')).toEqual({
      verdict: 'unsafe',
      threats: ['UNWANTED_SOFTWARE'],
    });
  });

  it('should be unknown when Google answers with an error', async () => {
    fetchMock.mockResolvedValue(reply([], 503));
    expect(await checkUrlSafety('https://example.com/')).toEqual({
      verdict: 'unknown',
      reason: 'HTTP 503',
    });
  });

  it('should be unknown, without leaking the key, when the request fails', async () => {
    fetchMock.mockRejectedValue(
      Object.assign(new Error('timed out calling ...?key=test-key'), {
        name: 'TimeoutError',
      }),
    );
    const result = await checkUrlSafety('https://example.com/');
    expect(result).toEqual({
      verdict: 'unknown',
      reason: 'TimeoutError: timed out calling ...?key=***',
    });
  });

  it('should be unknown when the reply is cut off', async () => {
    fetchMock.mockResolvedValue(reply([0x0a, 0x10, 0x0a]));
    expect((await checkUrlSafety('https://example.com/')).verdict).toBe(
      'unknown',
    );
  });

  it('should be unknown without calling Google when no key is set', async () => {
    vi.stubEnv('GOOGLE_SAFE_BROWSING_API_KEY', '');
    expect(await checkUrlSafety('https://example.com/')).toEqual({
      verdict: 'unknown',
      reason: 'no API key',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
