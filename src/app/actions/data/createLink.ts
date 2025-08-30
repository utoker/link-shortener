'use server';

import { customAlphabet } from 'nanoid';
import { CreateLinkFormSchema } from '@/lib/schemas/CreateLinkFormSchema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';
import { linkCreationRateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

// -----------------------------------------------------------------------------
// Result type
// -----------------------------------------------------------------------------
interface CreateLinkFieldErrors {
  url?: string[];
  slug?: string[];
}

export type CreateLinkResult = ActionResult<CreateLinkFieldErrors> & {
  slug?: string;
};

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------
const generateCleanSlug = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  6,
);

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------
export async function createLink(
  _prev: CreateLinkResult,
  formData: FormData,
): Promise<CreateLinkResult> {
  // ---------- rate limiting -------------------------------------------------
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  
  const { success } = await linkCreationRateLimit.limit(ip);
  if (!success) {
    return {
      success: false,
      formError: 'Too many link creation attempts. Please wait a minute before trying again.',
    };
  }

  // ---------- basic sanitising ----------------------------------------------
  let rawUrl = formData.get('url')?.toString().trim() ?? '';
  const rawSlug = formData.get('slug')?.toString() || undefined;

  if (!/^https?:\/\//i.test(rawUrl)) rawUrl = 'https://' + rawUrl;

  const parse = CreateLinkFormSchema.safeParse({ url: rawUrl, slug: rawSlug });

  if (!parse.success) {
    return {
      success: false,
      fieldErrors: parse.error.flatten().fieldErrors as CreateLinkFieldErrors,
    };
  }

  const { url, slug: maybeSlug } = parse.data;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let slug = maybeSlug?.trim() ?? '';

    // ---------- slug handling -----------------------------------------------
    if (!slug) {
      /* generate until unique (max 5 tries) */
      let attempts = 0;
      while (attempts < 5) {
        const candidate = generateCleanSlug();
        const { data: existing } = await supabase
          .from('links')
          .select('id')
          .eq('slug', candidate)
          .maybeSingle();
        if (!existing) {
          slug = candidate;
          break;
        }
        attempts++;
      }
      if (!slug) {
        return {
          success: false,
          formError: 'Could not generate a unique slug. Try again.',
        };
      }
    } else {
      /* user-provided slug must be unique */
      const { data: existing } = await supabase
        .from('links')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          fieldErrors: { slug: ['This slug is already taken.'] },
        };
      }
    }

    // ---------- insert -------------------------------------------------------
    const { error } = await supabase.from('links').insert({
      url,
      slug,
      user_id: user?.id ?? null,
      click_count: 0,
    });

    if (error) {
      console.error('createLink insert error:', error);
      return { success: false, formError: 'Failed to create link.' };
    }

    return { success: true, slug };
  } catch (err) {
    console.error('createLink unexpected error:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
