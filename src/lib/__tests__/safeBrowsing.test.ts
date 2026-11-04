import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkUrlSafety, checkUrlsSafety } from '../safeBrowsing';

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

describe('checkUrlsSafety', () => {
  const fetchMock = vi.fn();
  const NO_WAIT = [0, 0]; // retry delays

  // the URLs sent in each call to Google
  const askedFor = () =>
    fetchMock.mock.calls.map(([url]) =>
      new URL(url).searchParams.getAll('urls'),
    );

  beforeEach(() => {
    vi.stubEnv('GOOGLE_SAFE_BROWSING_API_KEY', 'test-key');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('should send at most 50 URLs per call', async () => {
    fetchMock.mockImplementation(async () => reply(CACHE_300S));
    const urls = Array.from(
      { length: 120 },
      (_, i) => `https://example.com/${i}`,
    );

    const verdicts = await checkUrlsSafety(urls, NO_WAIT);

    expect(askedFor().map((batch) => batch.length)).toEqual([50, 50, 20]);
    expect(verdicts.size).toBe(120);
    expect(
      Array.from(verdicts.values()).every((v) => v.verdict === 'safe'),
    ).toBe(true);
  });

  it('should keep each call under 12,000 characters of URLs', async () => {
    fetchMock.mockImplementation(async () => reply(CACHE_300S));
    const urls = Array.from(
      { length: 10 },
      (_, i) => `https://example.com/${i}?q=${'a'.repeat(2000)}`,
    );

    const verdicts = await checkUrlsSafety(urls, NO_WAIT);

    expect(askedFor().map((batch) => batch.length)).toEqual([5, 5]);
    for (const batch of askedFor()) {
      const query = new URLSearchParams(batch.map((u) => ['urls', u]));
      expect(query.toString().length).toBeLessThanOrEqual(12000);
    }
    expect(verdicts.size).toBe(10);
  });

  it('should ask about each URL of a call Google refuses, once', async () => {
    // Google can't take one of the URLs, so it refuses every call with it
    fetchMock.mockImplementation(async (url: string) =>
      new URL(url).searchParams.getAll('urls').includes('https://odd.example/')
        ? reply([], 400)
        : reply(CACHE_300S),
    );
    const urls = [
      'https://example.com/',
      'https://odd.example/',
      'https://example.org/',
    ];

    const verdicts = await checkUrlsSafety(urls, NO_WAIT);

    expect(askedFor()).toEqual([urls, ...urls.map((url) => [url])]);
    expect(verdicts.get('https://odd.example/')).toEqual({
      verdict: 'unknown',
      reason: 'HTTP 400',
    });
    expect(verdicts.get('https://example.com/')).toEqual({ verdict: 'safe' });
    expect(verdicts.get('https://example.org/')).toEqual({ verdict: 'safe' });
  });

  it('should send all calls at once', async () => {
    // Google answers only once all three calls are waiting, so calls made
    // one after another would never finish
    const waiting: (() => void)[] = [];
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          waiting.push(() => resolve(reply(CACHE_300S)));
          if (waiting.length === 3) waiting.forEach((answer) => answer());
        }),
    );
    const urls = Array.from(
      { length: 120 },
      (_, i) => `https://example.com/${i}`,
    );

    const verdicts = await checkUrlsSafety(urls, NO_WAIT);

    expect(verdicts.size).toBe(120);
  });

  it('should ask about each URL once', async () => {
    fetchMock.mockImplementation(async () => reply(CACHE_300S));

    await checkUrlsSafety(
      ['https://a.example/', 'https://a.example/', 'https://b.example/'],
      NO_WAIT,
    );

    expect(askedFor()).toEqual([['https://a.example/', 'https://b.example/']]);
  });

  it('should find which URLs of a flagged call it was by asking about each', async () => {
    // Google names a hit in its own form, without the scheme or the query
    fetchMock.mockImplementation(async (url: string) => {
      const asked = new URL(url).searchParams.getAll('urls');
      return reply(
        asked.includes('https://bad.example/login?x=1')
          ? [...threatUrl('bad.example/login', [2]), ...CACHE_300S]
          : CACHE_300S,
      );
    });
    const urls = [
      'https://example.com/',
      'https://bad.example/login?x=1',
      'https://example.org/',
    ];

    const verdicts = await checkUrlsSafety(urls, NO_WAIT);

    expect(askedFor()).toEqual([urls, ...urls.map((url) => [url])]);
    expect(verdicts.get('https://bad.example/login?x=1')).toEqual({
      verdict: 'unsafe',
      threats: ['SOCIAL_ENGINEERING'],
    });
    expect(verdicts.get('https://example.com/')).toEqual({ verdict: 'safe' });
    expect(verdicts.get('https://example.org/')).toEqual({ verdict: 'safe' });
  });

  it('should try a failed call again', async () => {
    fetchMock
      .mockResolvedValueOnce(reply([], 503))
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(reply(CACHE_300S));

    const verdicts = await checkUrlsSafety(['https://example.com/'], NO_WAIT);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(verdicts.get('https://example.com/')).toEqual({ verdict: 'safe' });
  });

  it('should leave the URLs unknown when Google keeps failing', async () => {
    fetchMock.mockImplementation(async () => reply([], 503));

    const verdicts = await checkUrlsSafety(
      ['https://example.com/', 'https://example.org/'],
      NO_WAIT,
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(verdicts.get('https://example.org/')).toEqual({
      verdict: 'unknown',
      reason: 'HTTP 503',
    });
  });

  it('should not wait to retry when no key is set', async () => {
    vi.stubEnv('GOOGLE_SAFE_BROWSING_API_KEY', '');

    // a retry would wait a minute and time the test out
    const verdicts = await checkUrlsSafety(['https://example.com/'], [60000]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(verdicts.get('https://example.com/')).toEqual({
      verdict: 'unknown',
      reason: 'no API key',
    });
  });
});
