import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUpWithPasswordAction } from '../signUpWithPassword';

vi.mock('@/lib/rateLimit', () => ({
  authRateLimit: {
    limit: vi.fn(),
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('signUpWithPasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return rate limit error when limit exceeded', async () => {
    const { authRateLimit } = await import('@/lib/rateLimit');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(authRateLimit.limit).mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('confirmPassword', 'password123');

    const result = await signUpWithPasswordAction({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.formError).toBe('Too many sign-up attempts. Please wait a minute before trying again.');
  });

  it('should proceed with sign up when rate limit allows', async () => {
    const { authRateLimit } = await import('@/lib/rateLimit');
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(authRateLimit.limit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1' }, session: { access_token: 't' } },
          error: null,
        }),
      },
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as any);

    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('confirmPassword', 'password123');

    const result = await signUpWithPasswordAction({ success: false }, formData);

    expect(authRateLimit.limit).toHaveBeenCalledWith('192.168.1.1');
    expect(result.success).toBe(true);
  });

  it('should send the confirmation link through /auth/callback and say it is needed', async () => {
    const { authRateLimit } = await import('@/lib/rateLimit');
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue(
      new Headers({ origin: 'https://reqq.cc', 'x-forwarded-for': '192.168.1.1' }) as any,
    );
    vi.mocked(authRateLimit.limit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });
    // with email confirmation on, Supabase answers without a session
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { signUp },
    } as any);

    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('confirmPassword', 'password123');

    const result = await signUpWithPasswordAction({ success: false }, formData);

    expect(signUp.mock.calls[0][0].options.emailRedirectTo).toBe(
      'https://reqq.cc/auth/callback',
    );
    expect(result).toEqual({ success: true, needsConfirmation: true });
  });
});
