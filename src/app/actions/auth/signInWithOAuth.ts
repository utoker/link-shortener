// src/actions/auth/signInWithOAuth.ts
// -----------------------------------------------------------------------------
// Server-action: start an OAuth flow (GitHub, Google, …) via Supabase
// -----------------------------------------------------------------------------
'use server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/lib/types/actions';

// -----------------------------------------------------------------------------
// Field-error map  (only one field: provider)
// -----------------------------------------------------------------------------
export interface OAuthFieldErrors {
  provider?: string[];
}

export type OAuthResult = ActionResult<OAuthFieldErrors>;

// Whitelisted providers — expand as needed
const ALLOWED_PROVIDERS = ['github', 'google'] as const;
type Provider = (typeof ALLOWED_PROVIDERS)[number];

export async function signInWithOAuthAction(
  _prev: OAuthResult,
  formData: FormData,
): Promise<OAuthResult> {
  const provider = formData.get('provider') as string | null;

  // -------- basic validation -------------------------------------------------
  if (!provider || !ALLOWED_PROVIDERS.includes(provider as Provider)) {
    return {
      success: false,
      fieldErrors: { provider: ['Unsupported provider.'] },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const origin =
      (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL!;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: { redirectTo: `${origin}/auth/callback` },
    });

    if (error) {
      return { success: false, formError: error.message };
    }

    // When running in a Server Component / Route, we can redirect immediately
    redirect(data.url);
    return { success: true }; // unreachable but satisfies the type
  } catch (err) {
    console.error('signInWithOAuthAction:', err);
    return {
      success: false,
      formError: 'Unexpected server error. Please try again.',
    };
  }
}
