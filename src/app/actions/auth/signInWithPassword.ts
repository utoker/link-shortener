// src/actions/auth/signInWithPassword.ts
// -----------------------------------------------------------------------------
// Server-action: email + password sign-in via Supabase
// -----------------------------------------------------------------------------
'use server';
import { signInSchema } from '@/lib/schemas/singInSchema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';
import { authRateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

// -----------------------------------------------------------------------------
// Result types
// -----------------------------------------------------------------------------
export interface SignInFieldErrors {
  email?: string[];
  password?: string[];
}

export type SignInResult = ActionResult<SignInFieldErrors>;

// -----------------------------------------------------------------------------
// Action implementation
// -----------------------------------------------------------------------------
export async function signInWithPasswordAction(
  _prev: SignInResult,
  formData: FormData,
): Promise<SignInResult> {
  // ---------- rate limiting -------------------------------------------------
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  
  const { success } = await authRateLimit.limit(ip);
  if (!success) {
    return {
      success: false,
      formError: 'Too many sign-in attempts. Please wait a minute before trying again.',
    };
  }

  // Convert FormData → plain object for Zod validation
  const data = {
    email: formData.get('email') as string | undefined,
    password: formData.get('password') as string | undefined,
  };

  const validation = signInSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors as SignInFieldErrors,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      return {
        success: false,
        formError: error.message || 'Invalid credentials. Please try again.',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('signInWithPasswordAction:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
