import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../app/auth/callback/route';
import { createSupabaseServerClient } from '../lib/supabase/server';

vi.mock('../lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

const exchangeCodeForSession = vi.fn();

const callback = async (query: string) =>
  (await GET(new Request(`https://reqq.cc/auth/callback${query}`))).headers.get(
    'location',
  );

describe('/auth/callback', () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { exchangeCodeForSession },
    } as any);
  });

  it('signs in with the code and goes home', async () => {
    expect(await callback('?code=abc')).toBe('https://reqq.cc/');
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
  });

  it('goes on to the password reset page', async () => {
    expect(
      await callback('?code=abc&redirect_to=/protected/reset-password'),
    ).toBe('https://reqq.cc/protected/reset-password');
  });

  it.each([
    '@evil.example/phish',
    '.evil.example/phish',
    '//evil.example',
    'https://evil.example',
    '/about',
  ])('never follows redirect_to=%s', async (target) => {
    expect(await callback(`?redirect_to=${encodeURIComponent(target)}`)).toBe(
      'https://reqq.cc/',
    );
    expect(
      await callback(`?code=abc&redirect_to=${encodeURIComponent(target)}`),
    ).toBe('https://reqq.cc/');
  });

  describe('when signing in fails', () => {
    const failWith = (code: string) =>
      exchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: { code, message: code },
      });

    it("doesn't open the reset page without a session", async () => {
      failWith('pkce_code_verifier_not_found');
      expect(
        await callback('?code=abc&redirect_to=/protected/reset-password'),
      ).toBe('https://reqq.cc/?auth=expired');
    });

    it('says a sign-up opened in another browser is confirmed', async () => {
      failWith('pkce_code_verifier_not_found');
      expect(await callback('?code=abc')).toBe(
        'https://reqq.cc/?auth=confirmed-sign-in',
      );
    });

    it('asks to try again otherwise', async () => {
      failWith('flow_state_expired');
      expect(await callback('?code=abc')).toBe('https://reqq.cc/?auth=failed');
    });
  });

  it('says an expired email link expired', async () => {
    expect(
      await callback(
        '?redirect_to=/protected/reset-password&error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
      ),
    ).toBe('https://reqq.cc/?auth=expired');
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('asks to try again after a cancelled sign-in', async () => {
    expect(
      await callback('?error=access_denied&error_description=cancelled'),
    ).toBe('https://reqq.cc/?auth=failed');
  });
});
