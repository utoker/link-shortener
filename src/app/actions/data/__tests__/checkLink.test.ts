import { describe, it, expect, vi, beforeEach } from 'vitest';
import { headers } from 'next/headers';
import { linkCheckerRateLimit } from '@/lib/rateLimit';
import { checkUrlSafety } from '@/lib/safeBrowsing';
import { traceLink } from '@/lib/linkTrace';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import { checkLink } from '../checkLink';

vi.mock('@/lib/rateLimit', () => ({
  linkCheckerRateLimit: { limit: vi.fn() },
}));

vi.mock('next/headers', () => ({ headers: vi.fn() }));

vi.mock('@/lib/supabase/public', () => ({
  createSupabasePublicClient: vi.fn(),
}));

vi.mock('@/lib/safeBrowsing', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/safeBrowsing')>()),
  checkUrlSafety: vi.fn(),
}));

// isAllowedTarget stays real: it decides which links are refused
vi.mock('@/lib/linkTrace', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/linkTrace')>()),
  traceLink: vi.fn(),
}));

const INVALID = 'Please enter a valid link (e.g., bit.ly/abc123).';

describe('checkLink action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(
      new Headers({ 'x-forwarded-for': '203.0.113.9' }) as any,
    );
    vi.mocked(linkCheckerRateLimit.limit).mockResolvedValue({
      success: true,
    } as any);
    vi.mocked(checkUrlSafety).mockResolvedValue({ verdict: 'safe' });
    vi.mocked(traceLink).mockResolvedValue({
      steps: [
        { url: 'https://bit.ly/abc', status: 301 },
        { url: 'https://example.com/', status: 200 },
      ],
      end: 'arrived',
    });
  });

  it('should refuse when the visitor has made too many checks', async () => {
    vi.mocked(linkCheckerRateLimit.limit).mockResolvedValue({
      success: false,
    } as any);

    expect(await checkLink('bit.ly/abc')).toEqual({
      ok: false,
      error: 'Too many checks. Please wait a minute before trying again.',
    });
    expect(linkCheckerRateLimit.limit).toHaveBeenCalledWith('203.0.113.9');
    expect(traceLink).not.toHaveBeenCalled();
  });

  it.each([
    '',
    '   ',
    'hello',
    'two words.com',
    'javascript:alert(1)',
    'http://localhost/',
    'http://127.0.0.1/',
    'http://169.254.169.254/latest/meta-data/',
    'https://example.com:8080/',
    'https://user:pass@example.com/',
  ])('should refuse %j without opening anything', async (input) => {
    expect(await checkLink(input)).toEqual({ ok: false, error: INVALID });
    expect(traceLink).not.toHaveBeenCalled();
    expect(checkUrlSafety).not.toHaveBeenCalled();
  });

  it('should refuse something that is not text', async () => {
    expect(await checkLink({ evil: true } as any)).toEqual({
      ok: false,
      error: INVALID,
    });
  });

  it('should follow the link, adding https://, and ask Google about its end', async () => {
    const result = await checkLink('  bit.ly/abc ');

    expect(vi.mocked(traceLink).mock.calls[0][0].href).toBe(
      'https://bit.ly/abc',
    );
    expect(checkUrlSafety).toHaveBeenCalledWith('https://example.com/');
    expect(result).toEqual({
      ok: true,
      steps: [
        { url: 'https://bit.ly/abc', status: 301 },
        { url: 'https://example.com/', status: 200 },
      ],
      end: 'arrived',
      safety: 'safe',
    });
  });

  it('should say what Google reports about an unsafe end', async () => {
    vi.mocked(checkUrlSafety).mockResolvedValue({
      verdict: 'unsafe',
      threats: ['SOCIAL_ENGINEERING', 'MALWARE'],
    });

    expect(await checkLink('bit.ly/abc')).toMatchObject({
      ok: true,
      safety: 'unsafe',
      threats: 'phishing or a deceptive site and malware',
    });
  });

  it('should report unknown when Google cannot be asked', async () => {
    vi.mocked(checkUrlSafety).mockResolvedValue({
      verdict: 'unknown',
      reason: 'no API key',
    });

    expect(await checkLink('bit.ly/abc')).toMatchObject({
      ok: true,
      safety: 'unknown',
    });
  });

  it.each(['not-allowed', 'blocked'] as const)(
    'should not ask Google when the check ended with %s',
    async (end) => {
      vi.mocked(traceLink).mockResolvedValue({
        steps: [{ url: 'https://bit.ly/abc', status: null }],
        end,
      });

      expect(await checkLink('bit.ly/abc')).toMatchObject({
        ok: true,
        end,
        safety: 'unknown',
      });
      expect(checkUrlSafety).not.toHaveBeenCalled();
    },
  );

  it('should look reqq.cc links up in the database', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ url: 'https://example.com/menu', blocked: false }],
      error: null,
    });
    vi.mocked(createSupabasePublicClient).mockReturnValue({ rpc } as any);
    await checkLink('reqq.cc/abc123');
    const { ownLink } = vi.mocked(traceLink).mock.calls[0][1]!;

    expect(await ownLink!('abc123')).toEqual({
      url: 'https://example.com/menu',
      blocked: false,
    });
    expect(rpc).toHaveBeenCalledWith('resolve_link', { p_slug: 'abc123' });

    rpc.mockResolvedValue({ data: [], error: null });
    expect(await ownLink!('nothere')).toBeNull();

    rpc.mockResolvedValue({ data: null, error: new Error('down') });
    await expect(ownLink!('abc123')).rejects.toThrow('down');
  });

  it('should answer with a plain error, and keep the link out of the log, when something breaks', async () => {
    vi.mocked(traceLink).mockRejectedValue(new Error('boom bit.ly/secret'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await checkLink('bit.ly/secret')).toEqual({
      ok: false,
      error: 'Something went wrong. Please try again.',
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
    log.mockRestore();
  });
});
