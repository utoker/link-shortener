'use server';

// src/actions/links/deleteLink.ts
// -----------------------------------------------------------------------------
// Server-action: delete a link by its ID for the currently logged-in user
// -----------------------------------------------------------------------------

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';

// -----------------------------------------------------------------------------
// Result type — no per-field errors for this simple action
// -----------------------------------------------------------------------------
export type DeleteLinkResult = ActionResult;

/**
 * Delete a link owned by the authenticated user.
 */
export async function deleteLink(
  _prev: DeleteLinkResult,
  formData: FormData,
): Promise<DeleteLinkResult> {
  const linkId = formData.get('linkId')?.toString() ?? '';

  if (!linkId) {
    return {
      success: false,
      formError: 'Missing link ID.',
    };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (!user || authErr) {
      return { success: false, formError: 'You must be signed in.' };
    }

    const { error, count } = await supabase
      .from('links')
      .delete({ count: 'exact' })
      .eq('id', linkId);

    if (error) {
      console.error('deleteLink error:', error);
      return { success: false, formError: 'Failed to delete the link.' };
    }

    if (count === 0) {
      return {
        success: false,
        formError: 'No link found or you lack permission.',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('deleteLink unexpected error:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
