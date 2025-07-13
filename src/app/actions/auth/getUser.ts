// src/actions/auth/getUser.ts
// -----------------------------------------------------------------------------
// Server-action: fetch the currently authenticated Supabase user
// -----------------------------------------------------------------------------
'use server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';
import type { User } from '@supabase/supabase-js';

export type GetUserResult = ActionResult & { user?: User };

export async function getUserAction(
  _prev: GetUserResult,
  _formData: FormData, // kept for API symmetry; not used here
): Promise<GetUserResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { success: false, formError: error.message };
    }

    return { success: true, user: data.user };
  } catch (err) {
    console.error('getUserAction:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
