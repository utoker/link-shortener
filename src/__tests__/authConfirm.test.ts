import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../app/auth/confirm/route';
import { createSupabaseServerClient } from '../lib/supabase/server';

vi.mock('../lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

const verifyOtp = vi.fn();

const confirm = async (query: string) =>
  (await GET(new Request(`https://reqq.cc/auth/confirm${query}`))).headers.get(
    'location',
  );

describe('/auth/confirm', () => {
  beforeEach(() => {
    verifyOtp.mockReset().mockResolvedValue({ data: {}, error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { verifyOtp },
    } as any);
  });

  it('confirms a sign-up and says so on the homepage', async () => {
    expect(await confirm('?token_hash=abc&type=email')).toBe(
      'https://reqq.cc/?auth=confirmed',
    );
    expect(verifyOtp).toHaveBeenCalledWith({
      type: 'email',
      token_hash: 'abc',
    });
  });

  it('accepts the older "signup" type too', async () => {
    expect(await confirm('?token_hash=abc&type=signup')).toBe(
      'https://reqq.cc/?auth=confirmed',
    );
  });

  it('signs a password reset in and goes to the reset page', async () => {
    expect(
      await confirm(
        '?token_hash=abc&type=recovery&next=/protected/reset-password',
      ),
    ).toBe('https://reqq.cc/protected/reset-password');
    expect(verifyOtp).toHaveBeenCalledWith({
      type: 'recovery',
      token_hash: 'abc',
    });
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '@evil.example/phish',
    '.evil.example/phish',
    '/about',
  ])('never follows next=%s', async (target) => {
    expect(
      await confirm(
        `?token_hash=abc&type=email&next=${encodeURIComponent(target)}`,
      ),
    ).toBe('https://reqq.cc/?auth=confirmed');
  });

  it.each([
    ['no token', '?type=email'],
    ['no type', '?token_hash=abc'],
    ['an unknown type', '?token_hash=abc&type=sms'],
    ['a type from the prototype', '?token_hash=abc&type=constructor'],
  ])('turns a link with %s away without asking Supabase', async (_, query) => {
    expect(await confirm(query)).toBe('https://reqq.cc/?auth=expired');
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it('says the link expired when Supabase refuses the token', async () => {
    verifyOtp.mockResolvedValue({
      data: {},
      error: { status: 403, code: 'otp_expired', message: 'expired' },
    });
    expect(await confirm('?token_hash=used&type=recovery')).toBe(
      'https://reqq.cc/?auth=expired',
    );
  });

  it.each([500, 0, undefined])(
    "doesn't blame the link when Supabase fails (status %s)",
    async (status) => {
      verifyOtp.mockResolvedValue({
        data: {},
        error: { status, message: 'down' },
      });
      expect(await confirm('?token_hash=abc&type=email')).toBe(
        'https://reqq.cc/?auth=failed',
      );
    },
  );
});
