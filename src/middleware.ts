// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from './lib/supabase/middleware';

export const config = {
  matcher:
    '/:slug((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)',
};

export async function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.slice(1);
  if (!slug) return NextResponse.next();

  const { supabase, res: draftRes } = createSupabaseMiddlewareClient(req);

  const { data: link } = await supabase
    .from('links')
    .select('url')
    .eq('slug', slug)
    .maybeSingle();

  if (!link) return draftRes; // fall through to 404 page

  const res = NextResponse.redirect(link.url, { status: 302 });
  const cookie = draftRes.headers.get('set-cookie');
  if (cookie) res.headers.set('set-cookie', cookie);
  return res;
}
