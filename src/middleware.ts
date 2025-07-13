// middleware.ts  (root)
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from './lib/supabase/middleware';

export const config = {
  matcher:
    '/:slug((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)',
};

export async function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.slice(1);
  if (!slug || slug === '404' || slug.includes('.')) return NextResponse.next();

  const { supabase, res } = createSupabaseMiddlewareClient(req);

  // fetch the target URL
  const { data: link } = await supabase
    .from('links')
    .select('url')
    .eq('slug', slug)
    .maybeSingle();

  if (!link?.url) return res;

  // atomic, awaited click-counter so the update isn't lost
  await supabase.rpc('increment_click', { p_slug: slug });

  return NextResponse.redirect(link.url, 307);
}
