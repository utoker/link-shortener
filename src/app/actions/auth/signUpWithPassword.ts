'use server';

import { z } from 'zod';
import { signUpSchema } from '@/lib/schemas/signUpSchema';
// src/actions/auth/signUpWithPassword.ts
// -----------------------------------------------------------------------------
// Server-action: create a new user with email + password via Supabase
// -----------------------------------------------------------------------------

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';
import { authRateLimit } from '@/lib/rateLimit';
import { getClientIP } from '@/lib/clientIp';
import { headers } from 'next/headers';

// -----------------------------------------------------------------------------
// Result types
// -----------------------------------------------------------------------------
export interface SignUpFieldErrors {
  name?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
}

export type SignUpResult = ActionResult<SignUpFieldErrors> & {
  /** The account exists but its email address must be confirmed first */
  needsConfirmation?: boolean;
};

// -----------------------------------------------------------------------------
// Action implementation
// -----------------------------------------------------------------------------
export async function signUpWithPasswordAction(
  _prev: SignUpResult,
  formData: FormData,
): Promise<SignUpResult> {
  // ---------- rate limiting -------------------------------------------------
  const ip = getClientIP(await headers());
  
  const { success } = await authRateLimit.limit(ip);
  if (!success) {
    return {
      success: false,
      formError: 'Too many sign-up attempts. Please wait a minute before trying again.',
    };
  }

  // ✅ include confirmPassword so Zod can validate it
  const data = {
    name: formData.get('name') as string | undefined,
    email: formData.get('email') as string | undefined,
    password: formData.get('password') as string | undefined,
    confirmPassword: formData.get('confirmPassword') as string | undefined,
  };

  const validation = signUpSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: z.flattenError(validation.error).fieldErrors as SignUpFieldErrors,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const origin =
      (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL!;

    // The confirmation email's link goes through /auth/callback, which signs
    // the new user in (in the browser they signed up in).
    const { data: signUp, error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        data: { name: validation.data.name, full_name: validation.data.name },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, formError: error.message };
    }

    // No session yet: Supabase sent a confirmation email instead.
    return { success: true, needsConfirmation: !signUp.session };
  } catch (err) {
    console.error('signUpWithPasswordAction:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
