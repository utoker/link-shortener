// What the homepage tells people after an email link or a sign-in, passed as
// /?auth=<key> by /auth/confirm and /auth/callback (which can't show anything
// themselves). No imports, so the homepage only pays for these few strings.

export const AUTH_NOTICE_PARAM = 'auth';

export const AUTH_NOTICES = {
  confirmed: { ok: true, text: 'Your email is confirmed. Welcome!' },
  // a sign-up link opened in another browser: confirmed, but not signed in
  'confirmed-sign-in': {
    ok: true,
    text: 'Your email is confirmed. Please sign in.',
  },
  expired: {
    ok: false,
    text: 'This link has expired or was already used. Please request a new one.',
  },
  failed: { ok: false, text: 'Signing in didn’t work. Please try again.' },
} as const;

export type AuthNotice = keyof typeof AUTH_NOTICES;

/** "/?auth=<notice>" on the given origin */
export const noticeUrl = (origin: string, notice: AuthNotice) =>
  `${origin}/?${AUTH_NOTICE_PARAM}=${notice}`;
