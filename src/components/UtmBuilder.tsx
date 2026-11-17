'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { setPrefillUrl } from '@/lib/prefill';
import { NO_TAGS, utmLink, type UtmTags } from '@/lib/utm';
import s from './UtmBuilder.module.css';

// The tool on /utm-builder: type a link and its campaign tags, copy the
// tagged link or take it to the shortener. Built in the browser, so nothing
// typed is sent anywhere.

const FIELDS: { tag: keyof UtmTags; label: string; placeholder: string }[] = [
  { tag: 'source', label: 'Source', placeholder: 'newsletter' },
  { tag: 'medium', label: 'Medium (optional)', placeholder: 'email' },
  { tag: 'campaign', label: 'Campaign (optional)', placeholder: 'spring_sale' },
  { tag: 'term', label: 'Term (optional)', placeholder: 'running+shoes' },
  { tag: 'content', label: 'Content (optional)', placeholder: 'header_button' },
];

/** Longest text a box takes. */
const MAX_LENGTH = 2000;

export default function UtmBuilder() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const [tags, setTags] = useState<UtmTags>(NO_TAGS);
  // the link that was last copied, for a moment after copying it
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const tagged = utmLink(link, tags);
  // a tagged link needs at least its source
  const result = tagged && tags.source.trim() ? tagged : null;

  // "Copied!" goes back to "Copy link" after a moment, or as soon as the
  // link on screen is no longer the one that was copied
  const copied = result !== null && copiedLink === result;
  useEffect(() => {
    if (copiedLink === null) return;
    const timer = setTimeout(() => setCopiedLink(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedLink]);

  const hint = !link.trim()
    ? 'Your tagged link will show up here.'
    : !tagged
      ? 'That doesn’t look like a web address.'
      : 'Add a source to tag the link.';

  const inputProps = {
    maxLength: MAX_LENGTH,
    autoComplete: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
    className: `font-baloo-thambi ${s.input}`,
  };
  const buttonClass =
    'font-baloo-thambi bg-blue hover:bg-darkblue flex-1 rounded-full py-3 text-xl transition-colors';

  return (
    <div className="bg-yellow mx-auto max-w-md space-y-4 rounded-[26px] px-8 pt-8 pb-10 text-black shadow-xl">
      <div className="space-y-2">
        <label htmlFor="utm-link" className="font-fredoka-one block text-xl">
          Your link
        </label>
        <Input
          id="utm-link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://example.com/page"
          inputMode="url"
          {...inputProps}
        />
      </div>

      {FIELDS.map(({ tag, label, placeholder }) => (
        <div key={tag} className="space-y-2">
          <label
            htmlFor={`utm-${tag}`}
            className="font-fredoka-one block text-xl"
          >
            {label}
          </label>
          <Input
            id={`utm-${tag}`}
            value={tags[tag]}
            onChange={(e) => setTags({ ...tags, [tag]: e.target.value })}
            placeholder={placeholder}
            {...inputProps}
          />
        </div>
      ))}

      <p
        aria-live="polite"
        className={`font-poppins rounded-2xl bg-white ${s.result} ${result ? '' : `text-darkblue ${s.hint}`}`}
      >
        {result ?? hint}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          disabled={!result}
          onClick={async () => {
            if (!result) return;
            try {
              await navigator.clipboard.writeText(result);
              setCopiedLink(result);
            } catch {
              // clipboard blocked: the link is on screen to copy by hand
            }
          }}
          className={buttonClass}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
        <Button
          disabled={!result}
          onClick={() => {
            if (!result) return;
            setPrefillUrl(result);
            router.push('/');
          }}
          className={buttonClass}
        >
          Shorten it
        </Button>
      </div>
    </div>
  );
}
