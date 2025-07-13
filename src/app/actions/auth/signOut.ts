// src/actions/auth/signOut.ts
// -----------------------------------------------------------------------------
// Server-action: sign the current user out via Supabase
// -----------------------------------------------------------------------------
'use server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';

// No field-specific errors, so we just use ActionResult with the default
// generic (undefined).
export type SignOutResult = ActionResult;

export async function signOutAction(
  _prev: SignOutResult,
  _formData: FormData, // kept for signature symmetry; not used here
): Promise<SignOutResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, formError: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('signOutAction:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
