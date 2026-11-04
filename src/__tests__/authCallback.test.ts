import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../app/auth/callback/route';
import { createSupabaseServerClient } from '../lib/supabase/server';

vi.mock('../lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

const callback = async (query: string) =>
  (await GET(new Request(`https://reqq.cc/auth/callback${query}`))).headers.get(
    'location',
  );

describe('/auth/callback', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { exchangeCodeForSession: vi.fn().mockResolvedValue({}) },
    } as any);
  });

  it('signs in with the code and goes home', async () => {
    expect(await callback('?code=abc')).toBe('https://reqq.cc/');
    const supabase = await vi.mocked(createSupabaseServerClient).mock.results[0]
      .value;
    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('abc');
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
    const location = await callback(
      `?redirect_to=${encodeURIComponent(target)}`,
    );
    expect(location).toBe('https://reqq.cc/');
  });
});
