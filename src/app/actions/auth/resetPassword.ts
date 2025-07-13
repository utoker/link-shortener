// src/actions/auth/resetPassword.ts
// -----------------------------------------------------------------------------
// Server-action: send a password-reset email via Supabase
// -----------------------------------------------------------------------------
'use server';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';

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

    // Make sure the user exists and is an email provider
    const { data, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr || !data) {
      return { success: false, formError: 'Failed to fetch user details.' };
    }

    const user = data.users.find((u) => u.email === email);
    if (!user) {
      return {
        success: false,
        fieldErrors: { email: ['No account found with this email.'] },
      };
    }
    if (user.app_metadata?.provider !== 'email') {
      return {
        success: false,
        fieldErrors: {
          email: [
            `This account is linked with a ${user.app_metadata?.provider} provider.`,
          ],
        },
      };
    }

    // Trigger Supabase reset-password email
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
