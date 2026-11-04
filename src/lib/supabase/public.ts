// Supabase client with only the public anon key and no cookies, for lookups
// anyone may make, like resolve_link in the middleware. It never sees the
// visitor's login: the cookie-based client renewed an expired one on short
// link visits (a round trip to Supabase Auth, ~220 ms on reqq.cc) and then
// dropped the result, since the new cookies never reached the response.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export function createSupabasePublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
