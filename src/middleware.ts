// ────────────────────────────────────────────────────────────────
// src/middleware.ts   –   Next 15  +  Supabase  Edge Middleware
// ────────────────────────────────────────────────────────────────
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from './lib/supabase/middleware';
import { redirectRateLimit, getClientIP } from './lib/rateLimit';

// Run only for single-segment paths without a dot, i.e. /slug. Slugs are
// [A-Za-z0-9_-], so this skips "/", files like /manifest.webmanifest and nested routes.
// (Next also matches an optional ".json" suffix, so avoid *.json public files.)
export const config = {
  matcher: '/:slug([^/.]+)',
};

const APP_PAGES = new Set(['about', 'terms', 'privacy', 'protected', 'auth']);

export async function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.slice(1); // "/yxzh5x" → "yxzh5x"

  // If no slug is present, we assume it's the home page
  if (!slug) return NextResponse.next(); // home page → normal routing

  // App pages share the /slug shape (they are reserved slugs, so no short link
  // can take them); /protected/* and /auth/* never match, but skip them too.
  if (APP_PAGES.has(slug.split('/')[0])) return NextResponse.next();

  // Rate limiting for redirects
  const ip = getClientIP(req);
  const { success, remaining, reset } = await redirectRateLimit.limit(ip);
  
  if (!success) {
    const response = new NextResponse('Too many requests', { status: 429 });
    response.headers.set('Retry-After', Math.round((reset - Date.now()) / 1000).toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }

  // 1️⃣  Supabase client that can read *and* set cookies
  const { supabase, res: draftRes } = createSupabaseMiddlewareClient(req);

  // 2️⃣  Look up the destination URL (RPC – links rows are owner-only under RLS)
  const { data: url, error: linkErr } = await supabase.rpc('resolve_slug', {
    p_slug: slug,
  });

  if (linkErr) {
    console.error('slug lookup failed:', linkErr);
    return draftRes; // 500 in prod, 200 shell in dev
  }
  if (!url) return NextResponse.rewrite(new URL('/404', req.url));

  // 3️⃣  Fire-and-forget click counter (doesn’t block the redirect)
  (async () => {
    const { error } = await supabase.rpc('increment_click', { p_slug: slug });

    if (error) console.error('increment_click failed:', error);
  })();

  // 4️⃣  Lean 302 redirect (0-byte body)
  const res = NextResponse.redirect(url, { status: 302 });

  // 5️⃣  Propagate any Set-Cookie from Supabase (refresh token, etc.)
  const cookie = draftRes.headers.get('set-cookie');
  if (cookie) res.headers.set('set-cookie', cookie);

  res.headers.set('x-middleware', 'hit');

  return res;
}
