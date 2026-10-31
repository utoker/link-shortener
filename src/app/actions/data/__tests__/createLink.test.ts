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

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(),
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
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
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
    const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(linkCreationRateLimit.limit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
      rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
      from: vi.fn(),
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as any);

    const insert = vi.fn().mockResolvedValue({ error: null });
    const mockAdmin = { from: vi.fn().mockReturnValue({ insert }) };
    vi.mocked(createSupabaseAdminClient).mockReturnValue(mockAdmin as any);

    const formData = new FormData();
    formData.append('url', 'https://example.com');

    const result = await createLink({ success: false }, formData);

    expect(linkCreationRateLimit.limit).toHaveBeenCalledWith('192.168.1.1');
    expect(mockSupabase.rpc).toHaveBeenCalledWith('slug_exists', {
      p_slug: result.slug,
    });
    expect(result.success).toBe(true);
    expect(result.slug).toBeDefined();
    // the insert goes through the secret-key client, owned by the signed-in user
    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockAdmin.from).toHaveBeenCalledWith('links');
    expect(insert).toHaveBeenCalledWith({
      url: 'https://example.com',
      slug: result.slug,
      user_id: 'user-123',
      click_count: 0,
    });
  });

  it('should reject a custom slug that is already taken', async () => {
    const { linkCreationRateLimit } = await import('@/lib/rateLimit');
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(linkCreationRateLimit.limit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const insert = vi.fn();
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
      from: vi.fn().mockReturnValue({ insert }),
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as any);
    const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');

    const formData = new FormData();
    formData.append('url', 'https://example.com');
    formData.append('slug', 'taken');

    const result = await createLink({ success: false }, formData);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('slug_exists', { p_slug: 'taken' });
    expect(result.success).toBe(false);
    expect(result.fieldErrors?.slug).toEqual(['This slug is already taken.']);
    expect(insert).not.toHaveBeenCalled();
    expect(createSupabaseAdminClient).not.toHaveBeenCalled();
  });

  it('should return validation error for invalid URL', async () => {
    const { linkCreationRateLimit } = await import('@/lib/rateLimit');
    const { headers } = await import('next/headers');

    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('192.168.1.1'),
    } as any);

    vi.mocked(linkCreationRateLimit.limit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const formData = new FormData();
    formData.append('url', 'invalid url with spaces');

    const result = await createLink({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.url).toBeDefined();
  });
});