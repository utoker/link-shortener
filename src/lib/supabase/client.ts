// /utils/supabase/client.ts
// Supabase client for the browser

import { createBrowserClient } from '@supabase/ssr';

export function createBrowserClientSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
