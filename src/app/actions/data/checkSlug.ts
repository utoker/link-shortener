'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isReservedSlug } from '@/lib/reservedSlugs';
import { slugCheckRateLimit } from '@/lib/rateLimit';
import { getClientIP } from '@/lib/clientIp';

/**
 * Whether a custom slug is free: true or false, or null when that couldn't
 * be found out (too many checks, or the lookup failed). createLink checks
 * again when the form is sent.
 */
export async function checkSlug(slug: string): Promise<boolean | null> {
  if (!slug || isReservedSlug(slug)) return false;

  const { success } = await slugCheckRateLimit.limit(
    getClientIP(await headers()),
  );
  if (!success) return null;

  const supabase = await createSupabaseServerClient();

  const { data: taken, error } = await supabase.rpc('slug_exists', {
    p_slug: slug,
  });
  if (error) {
    console.error('checkSlug lookup error:', error);
    return null;
  }

  return !taken;
}
