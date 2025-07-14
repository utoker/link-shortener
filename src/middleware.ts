// ────────────────────────────────────────────────────────────────
// src/middleware.ts   –   Next 15  +  Supabase  Edge Middleware
// ────────────────────────────────────────────────────────────────
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from './lib/supabase/middleware';

// Run for any path that looks like /slug (skip assets & Next internals)
export const config = {
  matcher:
    '/:slug((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)',
};

export async function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.slice(1); // "/yxzh5x" → "yxzh5x"
  if (!slug) return NextResponse.next(); // home page → normal routing

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
  if (!link) return draftRes; // fall through → 404 page

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

  return res;
}
