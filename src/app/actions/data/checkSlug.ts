'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function checkSlug(slug: string) {
  if (!slug) return false;

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from('links')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();

  return !data;
}
