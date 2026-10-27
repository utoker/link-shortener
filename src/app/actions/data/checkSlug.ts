'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function checkSlug(slug: string) {
  if (!slug) return false;

  const supabase = await createSupabaseServerClient();

  const { data: taken } = await supabase.rpc('slug_exists', { p_slug: slug });

  return !taken;
}
