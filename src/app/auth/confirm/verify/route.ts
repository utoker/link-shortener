import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { noticeUrl } from '../../../../lib/authNotice';
import { emailLink } from '../../../../lib/emailLinks';

// The button on /auth/confirm posts here. Unlike /auth/callback, which needs a
// cookie from the browser that asked for the email, the token alone is
// enough, so the link works in any browser or on another device.
// https://supabase.com/docs/guides/auth/server-side/nextjs

// 303: the browser follows a POST's redirect with a GET.
const go = (url: string) => NextResponse.redirect(url, 303);

export async function POST(request: Request) {
  const { origin } = new URL(request.url);

  // Only the form on our own page may sign someone in here; another site
  // could otherwise log its visitors into an account of its choosing.
  const from = request.headers.get('origin');
  if (from !== null && from !== origin) {
    console.warn('auth confirm: form from another site:', from);
    return go(noticeUrl(origin, 'failed'));
  }

  const form = await request.formData().catch(() => null);
  const tokenHash = form?.get('token_hash');
  const link = emailLink(form?.get('type')?.toString());
  if (typeof tokenHash !== 'string' || !tokenHash || !link) {
    return go(noticeUrl(origin, 'expired'));
  }

  // Signs the person in (the session cookies go out with the redirect).
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type: link.type,
    token_hash: tokenHash,
  });

  if (error) {
    console.warn('auth confirm failed:', link.type, error.code ?? error.message);
    // Supabase answers 403 for an expired or already used link; anything
    // else (Supabase down or unreachable, status 5xx or 0) isn't the link's
    // fault.
    const status = error.status ?? 0;
    const linkProblem = status >= 400 && status < 500;
    return go(noticeUrl(origin, linkProblem ? 'expired' : 'failed'));
  }

  return go(`${origin}${link.next}`);
}
