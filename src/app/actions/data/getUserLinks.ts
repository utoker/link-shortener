'use server';

// src/actions/links/getUserLinks.ts
// -----------------------------------------------------------------------------
// Fetch all links belonging to the currently authenticated user
// -----------------------------------------------------------------------------

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';
import { Link } from '@/lib/types/database';

export type GetUserLinksResult = ActionResult & { links?: Link[] };

export async function getUserLinks(
  _prev: GetUserLinksResult,
  _formData: FormData,
): Promise<GetUserLinksResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return { success: false, formError: 'You must be signed in.' };
    }

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getUserLinks error:', error);
      return { success: false, formError: 'Failed to fetch your links.' };
    }

    return { success: true, links: data ?? [] };
  } catch (err) {
    console.error('getUserLinks unexpected error:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
