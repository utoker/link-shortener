// Where the sign-up confirmation and password reset emails lead
// (/auth/confirm?token_hash=…&type=…). Opening the page uses nothing up: the
// link is only spent when the person presses the button. Some mail systems
// (e.g. Outlook's Safe Links) open every link in an email to scan it, which
// used to spend it before the person got there.
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { emailLink } from '@/lib/emailLinks';
import { AUTH_NOTICE_PARAM } from '@/lib/authNotice';

export const metadata: Metadata = {
  title: 'Confirm – reqq.cc',
  robots: { index: false, follow: false },
};

const TEXT = {
  recovery: { title: 'Reset your password', button: 'Choose a new password' },
  confirm: { title: 'Confirm your email', button: 'Confirm my email' },
};

export default async function ConfirmEmailLink({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string | string[]; type?: string | string[] }>;
}) {
  const { token_hash: tokenHash, type } = await searchParams;
  const link = typeof type === 'string' ? emailLink(type) : null;
  if (typeof tokenHash !== 'string' || !tokenHash || !link) {
    redirect(`/?${AUTH_NOTICE_PARAM}=expired`);
  }

  const text = link.type === 'recovery' ? TEXT.recovery : TEXT.confirm;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 pt-8 pb-12 text-center text-white sm:pt-16">
      <h1 className="font-fredoka-one mb-4 text-5xl">{text.title}</h1>
      <p className="font-poppins mb-8 text-lg">
        Press the button to continue.
      </p>
      {/* A plain form, so it works without JavaScript and ends in a full page
          load that picks up the new login. */}
      <form method="post" action="/auth/confirm/verify">
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={link.type} />
        <button
          type="submit"
          className="bg-yellow font-fredoka-one cursor-pointer rounded-full border-2 border-black px-6 py-2 text-2xl text-black transition hover:bg-yellow/80"
        >
          {text.button}
        </button>
      </form>
    </div>
  );
}
