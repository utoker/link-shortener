import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateLink } from '../updateLink';
import { linkEditRateLimit } from '@/lib/rateLimit';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { checkUrlSafety } from '@/lib/safeBrowsing';
import { headers } from 'next/headers';

vi.mock('@/lib/rateLimit', () => ({
  linkEditRateLimit: { limit: vi.fn() },
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock('@/lib/safeBrowsing', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/safeBrowsing')>()),
  checkUrlSafety: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

const OLD_URL = 'https://example.com/old';

// Signed in as user-1, who owns link-1 (slug "abc123") unless `owned` is false.
function setup({
  owned = true,
  user = { id: 'user-1' } as { id: string } | null,
} = {}) {
  vi.mocked(headers).mockResolvedValue({
    get: vi.fn().mockReturnValue('192.168.1.1'),
  } as any);
  vi.mocked(linkEditRateLimit.limit).mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
    pending: Promise.resolve(),
  });
  vi.mocked(checkUrlSafety).mockResolvedValue({ verdict: 'safe' });

  const maybeSingle = vi.fn().mockResolvedValue({
    data: owned ? { slug: 'abc123', url: OLD_URL } : null,
  });
  const select = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({ maybeSingle }),
  });
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnValue({ select }),
  } as any);

  const eqUser = vi.fn().mockResolvedValue({ error: null, count: 1 });
  const eqId = vi.fn().mockReturnValue({ eq: eqUser });
  const update = vi.fn().mockReturnValue({ eq: eqId });
  vi.mocked(createSupabaseAdminClient).mockReturnValue({
    from: vi.fn().mockReturnValue({ update }),
  } as any);

  return { update, eqId, eqUser };
}

function form(url: string, linkId = 'link-1') {
  const fd = new FormData();
  fd.append('linkId', linkId);
  fd.append('url', url);
  return fd;
}

describe('updateLink Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save the new destination for the owner and log the change', async () => {
    const { update, eqId, eqUser } = setup();
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    const result = await updateLink(
      { success: false },
      form('example.com/new'),
    );

    expect(result).toEqual({ success: true });
    expect(checkUrlSafety).toHaveBeenCalledWith('https://example.com/new');
    // a block from the weekly link check was about the old destination
    expect(update).toHaveBeenCalledWith(
      {
        url: 'https://example.com/new',
        safety_threats: null,
        safety_flagged_at: null,
        safety_checked_at: expect.any(String),
      },
      { count: 'exact' },
    );
    expect(eqId).toHaveBeenCalledWith('id', 'link-1');
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
    expect(info).toHaveBeenCalledWith(
      'updateLink:',
      'abc123',
      OLD_URL,
      '->',
      'https://example.com/new',
    );
    info.mockRestore();
  });

  it('should refuse when the edit limit is reached', async () => {
    const { update } = setup();
    vi.mocked(linkEditRateLimit.limit).mockResolvedValue({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const result = await updateLink(
      { success: false },
      form('example.com/new'),
    );

    expect(result.formError).toBe(
      'Too many edits. Please wait a minute before trying again.',
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('should apply the same URL rules as new links', async () => {
    const { update } = setup();

    const result = await updateLink({ success: false }, form('bit.ly/abc'));

    expect(result.fieldErrors?.url).toEqual([
      'Links to other URL shorteners are not allowed. Use the full destination link.',
    ]);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('should require a signed-in user', async () => {
    const { update } = setup({ user: null });

    const result = await updateLink(
      { success: false },
      form('example.com/new'),
    );

    expect(result.formError).toBe('You must be signed in.');
    expect(update).not.toHaveBeenCalled();
  });

  it("should not touch someone else's link", async () => {
    const { update } = setup({ owned: false });

    const result = await updateLink(
      { success: false },
      form('example.com/new', 'link-of-another-user'),
    );

    expect(result.formError).toBe('No link found or you lack permission.');
    expect(update).not.toHaveBeenCalled();
  });

  it('should refuse a URL that Google Safe Browsing reports as unsafe', async () => {
    const { update } = setup();
    vi.mocked(checkUrlSafety).mockResolvedValue({
      verdict: 'unsafe',
      threats: ['SOCIAL_ENGINEERING'],
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await updateLink(
      { success: false },
      form('bad.example/login'),
    );

    expect(result.fieldErrors?.url).toEqual([
      'Google Safe Browsing reports this link as unsafe.',
    ]);
    expect(update).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('should still save when Google cannot be reached, and log it', async () => {
    const { update } = setup();
    vi.mocked(checkUrlSafety).mockResolvedValue({
      verdict: 'unknown',
      reason: 'HTTP 503',
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    const result = await updateLink(
      { success: false },
      form('example.com/new'),
    );

    expect(result.success).toBe(true);
    // not checked yet: the weekly link check asks Google again
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        safety_threats: null,
        safety_checked_at: null,
      }),
      { count: 'exact' },
    );
    expect(error).toHaveBeenCalledWith(
      'updateLink: Safe Browsing check skipped:',
      'HTTP 503',
      'https://example.com/new',
    );
    error.mockRestore();
    info.mockRestore();
  });

  it('should do nothing when the destination is unchanged', async () => {
    const { update } = setup();

    const result = await updateLink({ success: false }, form(OLD_URL));

    expect(result).toEqual({ success: true });
    expect(update).not.toHaveBeenCalled();
  });
});
