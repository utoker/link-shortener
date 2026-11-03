// App emails through Resend's HTTP API (RESEND_API_KEY), from the address
// Supabase's sign-in emails already use, so send.reqq.cc is verified.
// https://resend.com/docs/api-reference/emails/send-email

const ENDPOINT = 'https://api.resend.com/emails';
const FROM = 'reqq.cc <noreply@send.reqq.cc>';
const TIMEOUT_MS = 10000;

export type EmailResult = { ok: true } | { ok: false; reason: string };

/** Plain-text email. Never throws: a failure comes back with its reason. */
export async function sendEmail(message: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: 'no RESEND_API_KEY' };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return { ok: true };
    const detail = (await res.text()).slice(0, 200);
    return { ok: false, reason: `HTTP ${res.status} ${detail}` };
  } catch (err) {
    return {
      ok: false,
      reason:
        err instanceof Error ? `${err.name}: ${err.message}` : String(err),
    };
  }
}
