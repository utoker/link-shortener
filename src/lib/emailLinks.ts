// The kinds of email link reqq.cc accepts (/auth/confirm?token_hash=…&type=…)
// and where each one leads once it's verified. The address comes from this
// list only, never from the link, so a link can't lead to another site.
import type { EmailOtpType } from '@supabase/supabase-js';

const NEXT_PAGE: Partial<Record<EmailOtpType, string>> = {
  email: '/?auth=confirmed',
  signup: '/?auth=confirmed',
  recovery: '/protected/reset-password',
};

export type EmailLink = { type: EmailOtpType; next: string };

/** The link's type and destination, or null for a type we don't send. */
export function emailLink(type: string | null | undefined): EmailLink | null {
  if (!type || !Object.hasOwn(NEXT_PAGE, type)) return null;
  const otpType = type as EmailOtpType;
  return { type: otpType, next: NEXT_PAGE[otpType]! };
}
