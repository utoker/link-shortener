import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config, middleware } from '../middleware';

vi.mock('../lib/rateLimit', () => ({
  redirectRateLimit: {
    limit: vi.fn(),
  },
  getClientIP: vi.fn().mockReturnValue('192.168.1.1'),
}));

vi.mock('../lib/supabase/middleware', () => ({
  createSupabaseMiddlewareClient: vi.fn().mockReturnValue({
    supabase: {
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
      limit: 100,
      remaining: 50,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const rpc = vi.fn().mockImplementation(async (fn: string) =>
      fn === 'resolve_slug'
        ? { data: 'https://example.com', error: null }
        : { data: 1, error: null },
    );

    vi.mocked(createSupabaseMiddlewareClient).mockReturnValue({
      supabase: { rpc } as any,
      res: new NextResponse(),
    });

    const request = new NextRequest('http://localhost:3000/test-slug');
    const response = await middleware(request);

    expect(rpc).toHaveBeenCalledWith('resolve_slug', { p_slug: 'test-slug' });
    expect(rpc).toHaveBeenCalledWith('increment_click', { p_slug: 'test-slug' });
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://example.com/');
  });

  it('should rewrite to 404 when the slug does not exist', async () => {
    const { redirectRateLimit } = await import('../lib/rateLimit');
    const { createSupabaseMiddlewareClient } = await import('../lib/supabase/middleware');

    vi.mocked(redirectRateLimit.limit).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 50,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.mocked(createSupabaseMiddlewareClient).mockReturnValue({
      supabase: { rpc } as any,
      res: new NextResponse(),
    });

    const request = new NextRequest('http://localhost:3000/missing-slug');
    const response = await middleware(request);

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/404');
    expect(rpc).not.toHaveBeenCalledWith('increment_click', expect.anything());
  });

  it('should return 429 when rate limit is exceeded', async () => {
    const { redirectRateLimit } = await import('../lib/rateLimit');

    vi.mocked(redirectRateLimit.limit).mockResolvedValue({
      success: false,
      limit: 100,
      remaining: 0,
      reset: Date.now() + 30000,
      pending: Promise.resolve(),
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

  it.each(['/about', '/terms', '/privacy'])(
    'should let the %s page through without a slug lookup',
    async (path) => {
      const { redirectRateLimit } = await import('../lib/rateLimit');
      const { createSupabaseMiddlewareClient } = await import('../lib/supabase/middleware');

      const response = await middleware(new NextRequest(`http://localhost:3000${path}`));

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(redirectRateLimit.limit).not.toHaveBeenCalled();
      expect(createSupabaseMiddlewareClient).not.toHaveBeenCalled();
    },
  );

  it('should skip rate limiting for home page', async () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });
});
describe('Middleware matcher', () => {
  it.each(['/abc123', '/My-link_1'])('should run for slug path %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each([
    '/',
    '/manifest.webmanifest',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/apple-icon.png',
    '/Images/logo.svg',
    '/_next/static/chunks/main.js',
    '/protected/about',
    '/auth/callback',
  ])('should skip %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
  });
});
