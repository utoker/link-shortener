'use server';

import { signUpSchema } from '@/lib/schemas/signUpSchema';
// src/actions/auth/signUpWithPassword.ts
// -----------------------------------------------------------------------------
// Server-action: create a new user with email + password via Supabase
// -----------------------------------------------------------------------------

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';

// -----------------------------------------------------------------------------
// Result types
// -----------------------------------------------------------------------------
export interface SignUpFieldErrors {
  name?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
}

export type SignUpResult = ActionResult<SignUpFieldErrors>;

// -----------------------------------------------------------------------------
// Action implementation
// -----------------------------------------------------------------------------
export async function signUpWithPasswordAction(
  _prev: SignUpResult,
  formData: FormData,
): Promise<SignUpResult> {
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
      fieldErrors: validation.error.flatten().fieldErrors as SignUpFieldErrors,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        data: { name: validation.data.name, full_name: validation.data.name },
      },
    });

    if (error) {
      return { success: false, formError: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('signUpWithPasswordAction:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
