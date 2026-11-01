import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config, middleware } from '../middleware';
import { createSupabaseAdminClient } from '../lib/supabase/admin';

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

vi.mock('../lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(),
}));

// Stand-in for the event whose waitUntil keeps the click count running.
const fakeEvent = () => ({ waitUntil: vi.fn() }) as unknown as NextFetchEvent;

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const TEST_URL = 'http://localhost:3000/test-slug';

// A click on that URL from a phone browser, unless headers say otherwise.
const click = (headers: Record<string, string> = {}, method = 'GET') =>
  new NextRequest(TEST_URL, {
    method,
    headers: { 'user-agent': IPHONE, ...headers },
  });

// The rate limit lets the request through, the slug leads to example.com and
// record_click answers with recordError.
async function mockRedirect(recordError: { message: string } | null = null) {
  const { redirectRateLimit } = await import('../lib/rateLimit');
  const { createSupabaseMiddlewareClient } = await import(
    '../lib/supabase/middleware'
  );

  vi.mocked(redirectRateLimit.limit).mockResolvedValue({
    success: true,
    limit: 100,
    remaining: 50,
    reset: Date.now() + 60000,
    pending: Promise.resolve(),
  });

  const resolved = { data: 'https://example.com', error: null };
  const recorded = { data: null, error: recordError };
  const rpc = vi.fn().mockResolvedValue(resolved);
  const adminRpc = vi.fn().mockResolvedValue(recorded);

  vi.mocked(createSupabaseMiddlewareClient).mockReturnValue({
    supabase: { rpc } as any,
    res: new NextResponse(),
  });
  vi.mocked(createSupabaseAdminClient).mockReturnValue({
    rpc: adminRpc,
  } as any);

  return { rpc, adminRpc };
}

describe('Middleware Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow requests when rate limit is not exceeded', async () => {
    const { rpc, adminRpc } = await mockRedirect();

    const request = click({
      referer: 'https://www.linkedin.com/feed/',
      'x-vercel-ip-country': 'TR',
    });
    const event = fakeEvent();
    const response = await middleware(request, event);

    expect(rpc).toHaveBeenCalledWith('resolve_slug', { p_slug: 'test-slug' });
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://example.com/');

    // the click is recorded after the redirect, kept alive by waitUntil
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
    await vi.mocked(event.waitUntil).mock.calls[0][0];
    expect(adminRpc).toHaveBeenCalledWith('record_click', {
      p_slug: 'test-slug',
      p_referrer_host: 'linkedin.com',
      p_country: 'TR',
      p_device: 'phone',
    });
  });

  it('should record a QR code scan with the QR source', async () => {
    const { adminRpc } = await mockRedirect();

    const event = fakeEvent();
    const response = await middleware(
      new NextRequest(`${TEST_URL}?qr`, { headers: { 'user-agent': IPHONE } }),
      event,
    );
    await vi.mocked(event.waitUntil).mock.calls[0][0];

    expect(response.headers.get('location')).toBe('https://example.com/');
    expect(adminRpc).toHaveBeenCalledWith('record_click', {
      p_slug: 'test-slug',
      p_referrer_host: 'qr',
      p_country: undefined,
      p_device: 'phone',
    });
  });

  it('should leave unknown click details out of the record', async () => {
    const { adminRpc } = await mockRedirect();

    const event = fakeEvent();
    await middleware(click(), event);
    await vi.mocked(event.waitUntil).mock.calls[0][0];

    expect(adminRpc).toHaveBeenCalledWith('record_click', {
      p_slug: 'test-slug',
      p_referrer_host: undefined,
      p_country: undefined,
      p_device: 'phone',
    });
  });

  it.each([
    ['a link-preview bot', click({ 'user-agent': 'facebookexternalhit/1.1' })],
    ['a request without a user-agent', new NextRequest(TEST_URL)],
    ['a HEAD request', click({}, 'HEAD')],
  ])('should redirect %s without counting it', async (_name, request) => {
    await mockRedirect();

    const event = fakeEvent();
    const response = await middleware(request, event);

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://example.com/');
    expect(event.waitUntil).not.toHaveBeenCalled();
    expect(createSupabaseAdminClient).not.toHaveBeenCalled();
  });

  it('should log a failed click count without affecting the redirect', async () => {
    await mockRedirect({ message: 'boom' });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const event = fakeEvent();
    const response = await middleware(click(), event);
    await vi.mocked(event.waitUntil).mock.calls[0][0];

    expect(response.status).toBe(302);
    expect(error).toHaveBeenCalledWith('record_click failed:', {
      message: 'boom',
    });
    error.mockRestore();
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

    const request = new NextRequest('http://localhost:3000/missing-slug', {
      headers: { 'user-agent': IPHONE },
    });
    const event = fakeEvent();
    const response = await middleware(request, event);

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/404');
    expect(event.waitUntil).not.toHaveBeenCalled();
    expect(createSupabaseAdminClient).not.toHaveBeenCalled();
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
    const response = await middleware(request, fakeEvent());

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('should skip rate limiting for protected routes', async () => {
    const request = new NextRequest('http://localhost:3000/protected/about');
    const response = await middleware(request, fakeEvent());

    expect(response.status).toBe(200);
  });

  it('should skip rate limiting for auth routes', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback');
    const response = await middleware(request, fakeEvent());

    expect(response.status).toBe(200);
  });

  it.each(['/about', '/terms', '/privacy'])(
    'should let the %s page through without a slug lookup',
    async (path) => {
      const { redirectRateLimit } = await import('../lib/rateLimit');
      const { createSupabaseMiddlewareClient } = await import('../lib/supabase/middleware');

      const response = await middleware(
        new NextRequest(`http://localhost:3000${path}`),
        fakeEvent(),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(redirectRateLimit.limit).not.toHaveBeenCalled();
      expect(createSupabaseMiddlewareClient).not.toHaveBeenCalled();
    },
  );

  it('should skip rate limiting for home page', async () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = await middleware(request, fakeEvent());

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
