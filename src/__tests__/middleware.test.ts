import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

vi.mock('../lib/rateLimit', () => ({
  redirectRateLimit: {
    limit: vi.fn(),
  },
  getClientIP: vi.fn().mockReturnValue('192.168.1.1'),
}));

vi.mock('../lib/supabase/middleware', () => ({
  createSupabaseMiddlewareClient: vi.fn().mockReturnValue({
    supabase: {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn(),
          }),
        }),
      }),
      rpc: vi.fn(),
    },
    res: new NextResponse(),
  }),
}));

describe('Middleware Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow requests when rate limit is not exceeded', async () => {
    const { redirectRateLimit } = await import('../lib/rateLimit');
    const { createSupabaseMiddlewareClient } = await import('../lib/supabase/middleware');

    vi.mocked(redirectRateLimit.limit).mockResolvedValue({
      success: true,
      remaining: 50,
      reset: Date.now() + 60000,
    });

    vi.mocked(createSupabaseMiddlewareClient).mockReturnValue({
      supabase: {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { url: 'https://example.com' },
                error: null,
              }),
            }),
          }),
        }),
        rpc: vi.fn().mockResolvedValue({ error: null }),
      } as any,
      res: new NextResponse(),
    });

    const request = new NextRequest('http://localhost:3000/test-slug');
    const response = await middleware(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://example.com/');
  });

  it('should return 429 when rate limit is exceeded', async () => {
    const { redirectRateLimit } = await import('../lib/rateLimit');

    vi.mocked(redirectRateLimit.limit).mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 30000,
    });

    const request = new NextRequest('http://localhost:3000/test-slug');
    const response = await middleware(request);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('should skip rate limiting for protected routes', async () => {
    const request = new NextRequest('http://localhost:3000/protected/about');
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it('should skip rate limiting for auth routes', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback');
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it('should skip rate limiting for home page', async () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });
});