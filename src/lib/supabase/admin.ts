// Supabase client with the server-only secret key. It bypasses RLS, so use it
// only for writes the server has already checked. Browsers can't write links
// (anon/authenticated have no INSERT/UPDATE on public.links), which keeps the
// rate limit and URL checks in createLink from being skipped.
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
