// ────────────────────────────────────────────────────────────────
// src/middleware.ts   –   Next 15  +  Supabase  Edge Middleware
// ────────────────────────────────────────────────────────────────
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from './lib/supabase/middleware';
import { redirectRateLimit, getClientIP } from './lib/rateLimit';

// Run for any path that looks like /slug (skip assets & Next internals)
export const config = {
  matcher:
    '/:slug((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)',
};

export async function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.slice(1); // "/yxzh5x" → "yxzh5x"

  // If no slug is present, we assume it's the home page
  if (!slug) return NextResponse.next(); // home page → normal routing

   // Skip redirect for /protected and /auth routes
  if (slug === 'protected' || slug === 'auth' || slug.startsWith('protected/') || slug.startsWith('auth/')) {
    return NextResponse.next();
  }

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

  // 2️⃣  Look up the destination URL
  const { data: link, error: linkErr } = await supabase
    .from('links')
    .select('url')
    .eq('slug', slug)
    .maybeSingle();

  if (linkErr) {
    console.error('slug lookup failed:', linkErr);
    return draftRes; // 500 in prod, 200 shell in dev
  }
  if (!link) return NextResponse.rewrite(new URL('/404', req.url));

  // 3️⃣  Fire-and-forget click counter (doesn’t block the redirect)
  (async () => {
    const { error } = await supabase.rpc('increment_click', { p_slug: slug });

    if (error) console.error('increment_click failed:', error);
  })();

  // 4️⃣  Lean 302 redirect (0-byte body)
  const res = NextResponse.redirect(link.url, { status: 302 });

  // 5️⃣  Propagate any Set-Cookie from Supabase (refresh token, etc.)
  const cookie = draftRes.headers.get('set-cookie');
  if (cookie) res.headers.set('set-cookie', cookie);

  res.headers.set('x-middleware', 'hit');

  return res;
}
