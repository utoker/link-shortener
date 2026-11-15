import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { noticeUrl } from '../../../lib/authNotice';

// Where the sign-up confirmation and password reset emails lead
// (/auth/confirm?token_hash=…&type=…). Unlike /auth/callback, which needs a
// cookie from the browser that asked for the email, the token alone is
// enough, so the link works in any browser or on another device.
// https://supabase.com/docs/guides/auth/server-side/nextjs

// Where each kind of link goes once it's verified. The address comes from
// this list only, never from the link, so a link can't lead to another site.
const NEXT_PAGE: Partial<Record<EmailOtpType, string>> = {
  email: '/?auth=confirmed',
  signup: '/?auth=confirmed',
  recovery: '/protected/reset-password',
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = type && Object.hasOwn(NEXT_PAGE, type) && NEXT_PAGE[type];

  if (!tokenHash || !type || !next) {
    return NextResponse.redirect(noticeUrl(origin, 'expired'));
  }

  // Signs the person in (the session cookies go out with the redirect).
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    console.warn('auth confirm failed:', type, error.code ?? error.message);
    // Supabase answers 403 for an expired or already used link; anything
    // else (Supabase down or unreachable, status 5xx or 0) isn't the link's
    // fault.
    const status = error.status ?? 0;
    const linkProblem = status >= 400 && status < 500;
    return NextResponse.redirect(
      noticeUrl(origin, linkProblem ? 'expired' : 'failed'),
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
