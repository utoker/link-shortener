import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetPasswordAction } from '../resetPassword';

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

describe('resetPasswordAction', () => {
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
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const formData = new FormData();
    formData.append('email', 'test@example.com');

    const result = await resetPasswordAction({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.formError).toBe('Too many password reset attempts. Please wait a minute before trying again.');
  });

  it('should proceed with password reset when rate limit allows', async () => {
    const { authRateLimit } = await import('@/lib/rateLimit');
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockImplementation((key) => {
        if (key === 'x-forwarded-for') return '192.168.1.1';
        if (key === 'origin') return 'http://localhost:3000';
        return null;
      }),
    } as any);

    vi.mocked(authRateLimit.limit).mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    const mockSupabase = {
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({
            data: {
              users: [
                {
                  email: 'test@example.com',
                  app_metadata: { provider: 'email' },
                },
              ],
            },
            error: null,
          }),
        },
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      },
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as any);

    const formData = new FormData();
    formData.append('email', 'test@example.com');

    const result = await resetPasswordAction({ success: false }, formData);

    expect(authRateLimit.limit).toHaveBeenCalledWith('192.168.1.1');
    expect(result.success).toBe(true);
  });

  it('should return validation error for missing email', async () => {
    const { authRateLimit } = await import('@/lib/rateLimit');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(authRateLimit.limit).mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    const formData = new FormData();

    const result = await resetPasswordAction({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.email).toEqual(['Email is required']);
  });
});