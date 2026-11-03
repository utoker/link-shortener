'use server';

// Change where a signed-in user's link points. The short address stays the
// same; the new URL goes through the same checks as a new link.

import { headers } from 'next/headers';
import { z } from 'zod';
import { CreateLinkFormSchema } from '@/lib/schemas/CreateLinkFormSchema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { ActionResult } from '@/lib/types/actions';
import { linkEditRateLimit } from '@/lib/rateLimit';
import { checkUrlSafety, UNSAFE_URL_MESSAGE } from '@/lib/safeBrowsing';
import { ensureProtocol } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Result type
// -----------------------------------------------------------------------------
export type UpdateLinkResult = ActionResult<{ url?: string[] }>;

const NOT_FOUND = 'No link found or you lack permission.';

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------
export async function updateLink(
  _prev: UpdateLinkResult,
  formData: FormData,
): Promise<UpdateLinkResult> {
  // ---------- rate limiting -------------------------------------------------
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  const { success } = await linkEditRateLimit.limit(ip);
  if (!success) {
    return {
      success: false,
      formError: 'Too many edits. Please wait a minute before trying again.',
    };
  }

  // ---------- validation ----------------------------------------------------
  const linkId = formData.get('linkId')?.toString() ?? '';
  if (!linkId) return { success: false, formError: 'Missing link ID.' };

  const parse = CreateLinkFormSchema.shape.url.safeParse(
    ensureProtocol(formData.get('url')?.toString().trim() ?? ''),
  );
  if (!parse.success) {
    return {
      success: false,
      fieldErrors: { url: z.flattenError(parse.error).formErrors },
    };
  }
  const url = parse.data;

  // Ask Google while ownership is checked; checkUrlSafety never rejects.
  const safety = checkUrlSafety(url);

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, formError: 'You must be signed in.' };

    // RLS only returns the user's own links
    const { data: link } = await supabase
      .from('links')
      .select('slug, url')
      .eq('id', linkId)
      .maybeSingle();
    if (!link) return { success: false, formError: NOT_FOUND };
    if (link.url === url) return { success: true };

    // ---------- Google Safe Browsing ----------------------------------------
    const result = await safety;
    if (result.verdict === 'unsafe') {
      console.warn('updateLink: refused unsafe URL', url, result.threats);
      return { success: false, fieldErrors: { url: [UNSAFE_URL_MESSAGE] } };
    }
    if (result.verdict === 'unknown') {
      // Same as new links: keep working when Google can't answer, and log it.
      console.error(
        'updateLink: Safe Browsing check skipped:',
        result.reason,
        url,
      );
    }

    // ---------- update -------------------------------------------------------
    // Browsers can't update links; the owner check is repeated in the query.
    // A new destination also lifts a block from the weekly link check, which
    // was about the old one.
    const { error, count } = await createSupabaseAdminClient()
      .from('links')
      .update(
        {
          url,
          safety_threats: null,
          safety_flagged_at: null,
          safety_checked_at:
            result.verdict === 'safe' ? new Date().toISOString() : null,
        },
        { count: 'exact' },
      )
      .eq('id', linkId)
      .eq('user_id', user.id);

    if (error) {
      console.error('updateLink update error:', error);
      return { success: false, formError: 'Failed to update the link.' };
    }
    if (count === 0) return { success: false, formError: NOT_FOUND };

    // A record of what the link pointed to before, in case it's reported.
    console.info('updateLink:', link.slug, link.url, '->', url);
    return { success: true };
  } catch (err) {
    console.error('updateLink unexpected error:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
