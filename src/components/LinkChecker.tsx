'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { checkLink, type CheckLinkResult } from '@/app/actions/data/checkLink';
import s from './LinkChecker.module.css';

// The tool on /link-checker: paste a link, see every address it passes
// through and where it ends, plus what Google Safe Browsing says about the
// end. The server follows the link (the checkLink action); this browser
// never opens it.

type Checked = Extract<CheckLinkResult, { ok: true }>;

const ADVISORY_URL = 'https://developers.google.com/safe-browsing/v4/advisory';

/** What happened at the last address, in a sentence. */
function ending({ steps, end }: Checked): string {
  const { status } = steps[steps.length - 1];
  switch (end) {
    case 'arrived':
      if (status !== null && status >= 400) {
        return `The last address answered with an error (HTTP ${status}), so the link may be broken or the site may refuse automated checks.`;
      }
      return steps.length === 1
        ? 'This link doesn’t redirect: it opens the address you typed.'
        : `This link redirects ${steps.length - 1} ${steps.length === 2 ? 'time' : 'times'} and ends at the last address.`;
    case 'too-many-redirects':
      return 'The link keeps redirecting, so the check stopped. It may be a loop.';
    case 'not-allowed':
      return 'The last address isn’t a public web address, so the check stopped before opening it.';
    case 'unreachable':
      return 'The last address didn’t answer. The site may be down or may not exist.';
    case 'timeout':
      return 'The last address took too long to answer, so the check stopped there.';
    case 'blocked':
      return 'reqq.cc has blocked this short link: Google Safe Browsing reports the site it leads to as unsafe.';
    case 'no-such-link':
      return 'There’s no reqq.cc link by that name. It may have been deleted, or the name may be mistyped.';
  }
}

/** Endings where Google wasn't asked, so there's nothing to say about it. */
const NOT_ASKED: Checked['end'][] = ['not-allowed', 'blocked', 'no-such-link'];

export default function LinkChecker() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CheckLinkResult | null>(null);
  const [pending, startTransition] = useTransition();

  const check = () =>
    startTransition(async () => {
      try {
        setResult(await checkLink(input));
      } catch {
        setResult({
          ok: false,
          error: 'Something went wrong. Please try again.',
        });
      }
    });

  return (
    <div className="bg-yellow mx-auto max-w-md space-y-4 rounded-[26px] px-8 pt-8 pb-10 text-black shadow-xl">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !pending) check();
        }}
      >
        <div className="space-y-2">
          <label htmlFor="check-link" className="font-fredoka-one block text-xl">
            Link to check
          </label>
          <Input
            id="check-link"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="bit.ly/abc123"
            maxLength={2048}
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`font-baloo-thambi ${s.input}`}
          />
        </div>
        <Button
          type="submit"
          disabled={!input.trim() || pending}
          className="font-baloo-thambi bg-blue hover:bg-darkblue w-full rounded-full py-3 text-xl transition-colors"
        >
          {pending ? 'Checking…' : 'Check link'}
        </Button>
      </form>

      <div
        aria-live="polite"
        className={`font-poppins rounded-2xl bg-white ${s.result}`}
      >
        {!result ? (
          <p className={`text-darkblue ${s.hint}`}>
            Where the link leads will show up here.
          </p>
        ) : !result.ok ? (
          <p className={`text-darkblue ${s.hint}`}>{result.error}</p>
        ) : (
          <>
            <ol className={s.steps}>
              {result.steps.map((step, i) => (
                <li key={i}>
                  {/* plain text on purpose: nothing here should be one
                      click away from opening */}
                  <span className={s.url}>{step.url}</span>
                  {step.status !== null && (
                    <span className={s.status}> (HTTP {step.status})</span>
                  )}
                </li>
              ))}
            </ol>
            <p>{ending(result)}</p>
            {result.safety === 'unsafe' && (
              <p className={s.warning}>
                Warning: Google Safe Browsing reports the last address as{' '}
                {result.threats}.{' '}
                <a
                  href={ADVISORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Advisory provided by Google
                </a>
                .
              </p>
            )}
            {result.safety === 'safe' && (
              <p>
                Google Safe Browsing lists no threats for the last address.
                That is no guarantee that it’s safe.
              </p>
            )}
            {result.safety === 'unknown' &&
              !NOT_ASKED.includes(result.end) && (
                <p>Google Safe Browsing couldn’t be asked just now.</p>
              )}
          </>
        )}
      </div>
    </div>
  );
}
