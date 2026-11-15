import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../app/auth/confirm/verify/route';
import { createSupabaseServerClient } from '../lib/supabase/server';

vi.mock('../lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

const verifyOtp = vi.fn();

// What the button on /auth/confirm sends.
const press = async (
  fields: Record<string, string>,
  origin: string | null = 'https://reqq.cc',
) => {
  const headers = new Headers();
  if (origin !== null) headers.set('origin', origin);
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  const res = await POST(
    new Request('https://reqq.cc/auth/confirm/verify', {
      method: 'POST',
      headers,
      body,
    }),
  );
  expect(res.status).toBe(303);
  return res.headers.get('location');
};

describe('/auth/confirm/verify', () => {
  beforeEach(() => {
    verifyOtp.mockReset().mockResolvedValue({ data: {}, error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { verifyOtp },
    } as any);
  });

  it('confirms a sign-up and says so on the homepage', async () => {
    expect(await press({ token_hash: 'abc', type: 'email' })).toBe(
      'https://reqq.cc/?auth=confirmed',
    );
    expect(verifyOtp).toHaveBeenCalledWith({
      type: 'email',
      token_hash: 'abc',
    });
  });

  it('accepts the older "signup" type too', async () => {
    expect(await press({ token_hash: 'abc', type: 'signup' })).toBe(
      'https://reqq.cc/?auth=confirmed',
    );
  });

  it('signs a password reset in and goes to the reset page', async () => {
    expect(await press({ token_hash: 'abc', type: 'recovery' })).toBe(
      'https://reqq.cc/protected/reset-password',
    );
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
      await press({ token_hash: 'abc', type: 'email', next: target }),
    ).toBe('https://reqq.cc/?auth=confirmed');
  });

  it('works when the browser sends no Origin header', async () => {
    expect(await press({ token_hash: 'abc', type: 'email' }, null)).toBe(
      'https://reqq.cc/?auth=confirmed',
    );
  });

  it.each(['https://evil.example', 'null', 'https://reqq.cc.evil.example'])(
    'refuses a form sent from %s',
    async (origin) => {
      expect(await press({ token_hash: 'abc', type: 'email' }, origin)).toBe(
        'https://reqq.cc/?auth=failed',
      );
      expect(verifyOtp).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['no token', { type: 'email' }],
    ['no type', { token_hash: 'abc' }],
    ['an unknown type', { token_hash: 'abc', type: 'sms' }],
    ['a type from the prototype', { token_hash: 'abc', type: 'constructor' }],
  ])('turns a form with %s away without asking Supabase', async (_, fields) => {
    expect(await press(fields)).toBe('https://reqq.cc/?auth=expired');
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it('says the link expired when Supabase refuses the token', async () => {
    verifyOtp.mockResolvedValue({
      data: {},
      error: { status: 403, code: 'otp_expired', message: 'expired' },
    });
    expect(await press({ token_hash: 'used', type: 'recovery' })).toBe(
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
      expect(await press({ token_hash: 'abc', type: 'email' })).toBe(
        'https://reqq.cc/?auth=failed',
      );
    },
  );
});
