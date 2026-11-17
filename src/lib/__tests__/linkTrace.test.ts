import { describe, it, expect, vi } from 'vitest';
import {
  isAllowedTarget,
  isPublicAddress,
  MAX_REDIRECTS,
  traceLink,
  visitOverNetwork,
  type Visit,
} from '../linkTrace';

/** A `visit` that answers from a table of address → reply. */
function fakeWeb(replies: Record<string, Visit>) {
  return vi.fn(
    async (url: URL): Promise<Visit> =>
      replies[url.href] ?? { failed: 'unreachable' },
  );
}

const redirect = (location: string, status = 301): Visit => ({
  status,
  location,
});
const page: Visit = { status: 200, location: null };

describe('isPublicAddress', () => {
  it.each(['8.8.8.8', '93.184.216.34', '2606:4700:4700::1111'])(
    'should accept %s',
    (address) => {
      expect(isPublicAddress(address)).toBe(true);
    },
  );

  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254', // cloud metadata
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '255.255.255.255',
    '::1',
    '::',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '::ffff:10.0.0.1',
    '64:ff9b::7f00:1',
    'not an address',
    '',
  ])('should refuse %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it('should accept a public IPv4 address written as IPv6', () => {
    expect(isPublicAddress('::ffff:8.8.8.8')).toBe(true);
  });
});

describe('isAllowedTarget', () => {
  it.each([
    'https://bit.ly/abc',
    'http://example.com/',
    'https://sub.example.co.uk/path?q=1#top',
    'https://8.8.8.8/',
  ])('should accept %s', (url) => {
    expect(isAllowedTarget(new URL(url))).toBe(true);
  });

  it.each([
    'ftp://example.com/',
    'file:///etc/passwd',
    'javascript:alert(1)',
    'https://example.com:8443/',
    'http://example.com:22/',
    'https://user:pass@example.com/',
    'https://user@example.com/',
    'http://localhost/',
    'http://intranet/',
    'http://127.0.0.1/',
    'http://2130706433/', // 127.0.0.1 as one number
    'http://0x7f.1/',
    'http://[::1]/',
    'http://[::ffff:127.0.0.1]/',
    'http://169.254.169.254/latest/meta-data/',
    'http://192.168.0.1/',
    `https://example.com/${'a'.repeat(2100)}`,
  ])('should refuse %s', (url) => {
    expect(isAllowedTarget(new URL(url))).toBe(false);
  });
});

describe('traceLink', () => {
  it('should follow redirects to the page they end at', async () => {
    const visit = fakeWeb({
      'https://bit.ly/abc': redirect('https://t.co/xyz'),
      'https://t.co/xyz': redirect('https://example.com/landing', 302),
      'https://example.com/landing': page,
    });

    expect(await traceLink(new URL('https://bit.ly/abc'), { visit })).toEqual({
      steps: [
        { url: 'https://bit.ly/abc', status: 301 },
        { url: 'https://t.co/xyz', status: 302 },
        { url: 'https://example.com/landing', status: 200 },
      ],
      end: 'arrived',
    });
  });

  it('should report a link that does not redirect as it is', async () => {
    const visit = fakeWeb({ 'https://example.com/': page });

    expect(await traceLink(new URL('https://example.com'), { visit })).toEqual({
      steps: [{ url: 'https://example.com/', status: 200 }],
      end: 'arrived',
    });
  });

  it('should resolve a relative Location against the address it came from', async () => {
    const visit = fakeWeb({
      'https://example.com/a/b': redirect('../c?x=1'),
      'https://example.com/c?x=1': page,
    });

    const { steps } = await traceLink(new URL('https://example.com/a/b'), {
      visit,
    });

    expect(steps.map((step) => step.url)).toEqual([
      'https://example.com/a/b',
      'https://example.com/c?x=1',
    ]);
  });

  it('should stop at an error status or a redirect without a Location', async () => {
    const visit = fakeWeb({
      'https://example.com/gone': { status: 404, location: null },
      'https://example.com/odd': { status: 302, location: null },
    });

    expect(
      await traceLink(new URL('https://example.com/gone'), { visit }),
    ).toEqual({
      steps: [{ url: 'https://example.com/gone', status: 404 }],
      end: 'arrived',
    });
    expect(
      (await traceLink(new URL('https://example.com/odd'), { visit })).end,
    ).toBe('arrived');
  });

  it('should not open a redirect target inside a private network', async () => {
    const visit = fakeWeb({
      'https://evil.example/': redirect('http://169.254.169.254/latest/'),
    });

    expect(await traceLink(new URL('https://evil.example/'), { visit })).toEqual(
      {
        steps: [
          { url: 'https://evil.example/', status: 301 },
          { url: 'http://169.254.169.254/latest/', status: null },
        ],
        end: 'not-allowed',
      },
    );
    expect(visit).toHaveBeenCalledTimes(1);
  });

  it.each(['file:///etc/passwd', 'http://localhost:3000/', 'gopher://x.example/'])(
    'should not open a redirect to %s',
    async (target) => {
      const visit = fakeWeb({ 'https://evil.example/': redirect(target) });

      const trace = await traceLink(new URL('https://evil.example/'), { visit });

      expect(trace.end).toBe('not-allowed');
      expect(visit).toHaveBeenCalledTimes(1);
    },
  );

  it('should stop at a loop', async () => {
    const visit = fakeWeb({
      'https://a.example/': redirect('https://b.example/'),
      'https://b.example/': redirect('https://a.example/'),
    });

    const trace = await traceLink(new URL('https://a.example/'), { visit });

    expect(trace.end).toBe('too-many-redirects');
    expect(visit).toHaveBeenCalledTimes(2);
  });

  it(`should stop after ${MAX_REDIRECTS} redirects`, async () => {
    const visit = vi.fn(
      async (url: URL): Promise<Visit> =>
        redirect(`https://example.com/${Number(url.pathname.slice(1)) + 1}`),
    );

    const trace = await traceLink(new URL('https://example.com/0'), { visit });

    expect(trace.end).toBe('too-many-redirects');
    expect(visit).toHaveBeenCalledTimes(MAX_REDIRECTS + 1);
    expect(trace.steps).toHaveLength(MAX_REDIRECTS + 2);
  });

  it.each(['unreachable', 'timeout', 'not-allowed'] as const)(
    'should end with %s when an address fails that way',
    async (failed) => {
      const visit = fakeWeb({
        'https://bit.ly/abc': redirect('https://down.example/'),
        'https://down.example/': { failed },
      });

      expect(await traceLink(new URL('https://bit.ly/abc'), { visit })).toEqual({
        steps: [
          { url: 'https://bit.ly/abc', status: 301 },
          { url: 'https://down.example/', status: null },
        ],
        end: failed,
      });
    },
  );

  it('should stop when the whole chain takes too long', async () => {
    let time = 0;
    const visit = vi.fn(async (_url: URL, _timeoutMs: number): Promise<Visit> => {
      time += 3000;
      return redirect(`https://example.com/${time}`);
    });

    const trace = await traceLink(new URL('https://example.com/'), {
      visit,
      now: () => time,
    });

    expect(trace.end).toBe('timeout');
    expect(visit).toHaveBeenCalledTimes(3); // 8 s in all
    // the last address gets only the time that is left
    expect(visit.mock.calls.map((call) => call[1])).toEqual([4000, 4000, 2000]);
  });

  describe('reqq.cc links', () => {
    it('should look a reqq.cc link up instead of opening it', async () => {
      const visit = fakeWeb({ 'https://example.com/menu': page });
      const ownLink = vi
        .fn()
        .mockResolvedValue({ url: 'https://example.com/menu', blocked: false });

      expect(
        await traceLink(new URL('https://reqq.cc/abc123?qr'), {
          visit,
          ownLink,
        }),
      ).toEqual({
        steps: [
          { url: 'https://reqq.cc/abc123?qr', status: 302 },
          { url: 'https://example.com/menu', status: 200 },
        ],
        end: 'arrived',
      });
      expect(ownLink).toHaveBeenCalledWith('abc123');
      expect(visit).toHaveBeenCalledTimes(1);
    });

    it('should say when there is no reqq.cc link by that name', async () => {
      const visit = fakeWeb({});

      expect(
        await traceLink(new URL('https://reqq.cc/nothere'), {
          visit,
          ownLink: async () => null,
        }),
      ).toEqual({
        steps: [{ url: 'https://reqq.cc/nothere', status: 404 }],
        end: 'no-such-link',
      });
      expect(visit).not.toHaveBeenCalled();
    });

    it('should stop at a blocked reqq.cc link without showing where it led', async () => {
      const visit = fakeWeb({});

      expect(
        await traceLink(new URL('https://reqq.cc/bad'), {
          visit,
          ownLink: async () => ({ url: 'https://evil.example/', blocked: true }),
        }),
      ).toEqual({
        steps: [{ url: 'https://reqq.cc/bad', status: null }],
        end: 'blocked',
      });
      expect(visit).not.toHaveBeenCalled();
    });

    it('should end as unreachable when the lookup fails', async () => {
      const trace = await traceLink(new URL('https://reqq.cc/abc123'), {
        visit: fakeWeb({}),
        ownLink: async () => {
          throw new Error('database down');
        },
      });

      expect(trace.end).toBe('unreachable');
    });

    it("should open reqq.cc's own pages like any other address", async () => {
      const visit = fakeWeb({ 'https://reqq.cc/about': page });
      const ownLink = vi.fn();

      await traceLink(new URL('https://reqq.cc/about'), { visit, ownLink });

      expect(ownLink).not.toHaveBeenCalled();
      expect(visit).toHaveBeenCalledTimes(1);
    });
  });
});

describe('visitOverNetwork', () => {
  // localhost resolves from the hosts file, so this needs no network
  it('should refuse a name that resolves to this machine', async () => {
    expect(await visitOverNetwork(new URL('http://localhost/'), 2000)).toEqual({
      failed: 'not-allowed',
    });
  });
});
