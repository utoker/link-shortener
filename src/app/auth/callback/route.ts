import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { noticeUrl } from '../../../lib/authNotice';

// Pages an auth email may send people on to. redirect_to is pasted after
// "https://reqq.cc", so anything else (e.g. "@evil.example" or ".evil.example")
// could lead to another site; those go to the homepage instead.
const REDIRECT_PAGES = new Set(['/protected/reset-password']);

export async function GET(request: Request) {
  // GitHub and Google sign-ins come back here with a code to exchange for a
  // session, as do emails sent before they switched to /auth/confirm.
  // The exchange needs a cookie set in the browser that started the sign-in.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString();
  const knownPage = redirectTo && REDIRECT_PAGES.has(redirectTo);

  if (!code) {
    // Supabase sends people back with ?error=… when an email link has
    // expired or was used, or when a GitHub/Google sign-in was cancelled.
    const errorCode = requestUrl.searchParams.get('error_code');
    if (errorCode || requestUrl.searchParams.has('error')) {
      console.warn('auth callback error:', errorCode);
      return NextResponse.redirect(
        noticeUrl(origin, errorCode === 'otp_expired' ? 'expired' : 'failed'),
      );
    }
    return NextResponse.redirect(`${origin}/`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.warn('auth callback exchange failed:', error.code ?? error.message);
    // Not signed in, so the reset page would only fail after the new
    // password was typed; ask for a new email instead.
    if (redirectTo === '/protected/reset-password') {
      return NextResponse.redirect(noticeUrl(origin, 'expired'));
    }
    // A sign-up email opened in another browser: Supabase has confirmed the
    // address already, but the session can't be handed over here.
    if (error.code === 'pkce_code_verifier_not_found') {
      return NextResponse.redirect(noticeUrl(origin, 'confirmed-sign-in'));
    }
    return NextResponse.redirect(noticeUrl(origin, 'failed'));
  }

  if (knownPage) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/`);
}
