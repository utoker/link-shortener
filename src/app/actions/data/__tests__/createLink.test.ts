import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLink } from '../createLink';

vi.mock('@/lib/rateLimit', () => ({
  linkCreationRateLimit: {
    limit: vi.fn(),
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('createLink Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return rate limit error when limit exceeded', async () => {
    const { linkCreationRateLimit } = await import('@/lib/rateLimit');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(linkCreationRateLimit.limit).mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const formData = new FormData();
    formData.append('url', 'https://example.com');

    const result = await createLink({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.formError).toBe('Too many link creation attempts. Please wait a minute before trying again.');
  });

  it('should proceed with link creation when rate limit allows', async () => {
    const { linkCreationRateLimit } = await import('@/lib/rateLimit');
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(linkCreationRateLimit.limit).mockResolvedValue({
      success: true,
      remaining: 9,
      reset: Date.now() + 60000,
    });

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as any);

    const formData = new FormData();
    formData.append('url', 'https://example.com');

    const result = await createLink({ success: false }, formData);

    expect(linkCreationRateLimit.limit).toHaveBeenCalledWith('192.168.1.1');
    expect(result.success).toBe(true);
    expect(result.slug).toBeDefined();
  });

  it('should return validation error for invalid URL', async () => {
    const { linkCreationRateLimit } = await import('@/lib/rateLimit');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(linkCreationRateLimit.limit).mockResolvedValue({
      success: true,
      remaining: 9,
      reset: Date.now() + 60000,
    });

    const formData = new FormData();
    formData.append('url', 'invalid url with spaces');

    const result = await createLink({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.url).toBeDefined();
  });
});