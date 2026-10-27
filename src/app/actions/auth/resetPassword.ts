// src/actions/auth/resetPassword.ts
// -----------------------------------------------------------------------------
// Server-action: send a password-reset email via Supabase
// -----------------------------------------------------------------------------
'use server';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';
import { authRateLimit } from '@/lib/rateLimit';

// -----------------------------------------------------------------------------
// Result types
// -----------------------------------------------------------------------------
export interface ResetPwFieldErrors {
  email?: string[];
}

export type ResetPwResult = ActionResult<ResetPwFieldErrors>;

// -----------------------------------------------------------------------------
// Action implementation
// -----------------------------------------------------------------------------
export async function resetPasswordAction(
  _prev: ResetPwResult,
  formData: FormData,
): Promise<ResetPwResult> {
  // ---------- rate limiting -------------------------------------------------
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  
  const { success } = await authRateLimit.limit(ip);
  if (!success) {
    return {
      success: false,
      formError: 'Too many password reset attempts. Please wait a minute before trying again.',
    };
  }

  // ------- basic validation --------------------------------------------------
  const email = formData.get('email') as string | null;

  if (!email || email.trim() === '') {
    return {
      success: false,
      fieldErrors: { email: ['Email is required'] },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const origin =
      (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL!;

    // Trigger Supabase reset-password email. Supabase succeeds silently for
    // unknown addresses, so the response never reveals whether an account exists.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
    });

    if (error) {
      return { success: false, formError: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('resetPasswordAction:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
