'use server';

import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function getAllSlugs(): Promise<{ slug: string }[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from('links').select('slug');

  if (error) {
    console.error('Error fetching all slugs:', error.message);
    return [];
  }

  return data || [];
}
