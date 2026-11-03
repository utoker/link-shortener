// ────────────────────────────────────────────────────────────────
// src/middleware.ts   –   Next 15  +  Supabase  Edge Middleware
// ────────────────────────────────────────────────────────────────
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from 'next/server';
import { createSupabaseMiddlewareClient } from './lib/supabase/middleware';
import { createSupabaseAdminClient } from './lib/supabase/admin';
import { redirectRateLimit, getClientIP } from './lib/rateLimit';
import { clickDetails, isCountedClick } from './lib/clickDetails';

// Run only for single-segment paths without a dot, i.e. /slug. Slugs are
// [A-Za-z0-9_-], so this skips "/", files like /manifest.webmanifest and nested routes.
// (Next also matches an optional ".json" suffix, so avoid *.json public files.)
export const config = {
  matcher: '/:slug([^/.]+)',
};

const APP_PAGES = new Set(['about', 'terms', 'privacy', 'protected', 'auth']);

export async function middleware(req: NextRequest, event: NextFetchEvent) {
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
  const { data, error: linkErr } = await supabase.rpc('resolve_link', {
    p_slug: slug,
  });

  if (linkErr) {
    console.error('slug lookup failed:', linkErr);
    return draftRes; // 500 in prod, 200 shell in dev
  }
  const link = data?.[0];
  if (!link) return NextResponse.rewrite(new URL('/404', req.url));

  // Google Safe Browsing flagged the destination (weekly link check): show a
  // warning instead of redirecting, and don't count it as a click.
  if (link.blocked) return NextResponse.rewrite(new URL('/blocked', req.url));

  // 3️⃣  Click counter (people only, not preview bots): doesn’t block the
  //     redirect, and waitUntil keeps the function running until it’s stored.
  //     record_click only accepts the server’s secret key.
  if (isCountedClick(req)) {
    event.waitUntil(
      (async () => {
        const { referrerHost, country, device } = clickDetails(req);
        const admin = createSupabaseAdminClient();
        // unknown values are left out, so the database stores null
        const { error } = await admin.rpc('record_click', {
          p_slug: slug,
          p_referrer_host: referrerHost ?? undefined,
          p_country: country ?? undefined,
          p_device: device,
        });

        if (error) console.error('record_click failed:', error);
      })(),
    );
  }

  // 4️⃣  Lean 302 redirect (0-byte body)
  const res = NextResponse.redirect(link.url, { status: 302 });

  // 5️⃣  Propagate any Set-Cookie from Supabase (refresh token, etc.)
  const cookie = draftRes.headers.get('set-cookie');
  if (cookie) res.headers.set('set-cookie', cookie);

  res.headers.set('x-middleware', 'hit');

  return res;
}
