'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { download, svgDataUrl } from '@/lib/download';
import { qrContent, textQrPng, textQrSvg } from '@/lib/qr';
import s from './QrGenerator.module.css';

// The tool on /qr-code-generator: type a link or text, see its QR code, save
// it. The code is drawn in the browser, so what's typed is never sent anywhere.

/** Longest text the box takes; a code holds a little more than this. */
const MAX_LENGTH = 2000;

export default function QrGenerator() {
  const [input, setInput] = useState('');
  // the last drawing: the text it was for, and the code (null if the text
  // didn't fit in one)
  const [drawn, setDrawn] = useState<{
    content: string;
    svg: string | null;
  } | null>(null);

  const content = qrContent(useDebounce(input, 200));

  // The code on screen and the text it holds. While a new text is being
  // drawn the last code stays; an empty box shows none.
  const code =
    content && drawn?.svg ? { content: drawn.content, svg: drawn.svg } : null;
  const failed = !!drawn && drawn.content === content && drawn.svg === null;

  // Draw the code a moment after typing stops (this also loads the QR library)
  useEffect(() => {
    if (!content) return;

    let active = true;
    textQrSvg(content)
      .then((svg) => active && setDrawn({ content, svg }))
      .catch(() => active && setDrawn({ content, svg: null }));
    return () => {
      active = false;
    }; // drop the result if the text changed meanwhile
  }, [content]);

  const buttonClass =
    'font-baloo-thambi bg-blue hover:bg-darkblue flex-1 rounded-full py-3 text-xl transition-colors';

  return (
    <div className="bg-yellow mx-auto max-w-md space-y-4 rounded-[26px] px-8 pt-8 pb-10 text-black shadow-xl">
      <div className="space-y-2">
        <label htmlFor="qr-text" className="font-fredoka-one block text-xl">
          Link or text
        </label>
        <Input
          id="qr-text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com"
          maxLength={MAX_LENGTH}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`font-baloo-thambi ${s.input}`}
        />
      </div>

      <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-white">
        {code ? (
          <img
            src={svgDataUrl(code.svg)}
            alt={`QR code for ${code.content}`}
            className="h-full w-full"
          />
        ) : (
          <span className={`font-poppins text-darkblue text-center ${s.placeholder}`}>
            {failed
              ? 'That’s too long for one QR code. Try a shorter text.'
              : 'Your QR code will show up here.'}
          </span>
        )}
      </div>

      <p aria-live="polite" className={`font-poppins text-center ${s.content}`}>
        {code && <>Scans as: {code.content}</>}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          disabled={!code}
          onClick={async () =>
            code && download(await textQrPng(code.content), 'qr-code.png')
          }
          className={buttonClass}
        >
          Download PNG
        </Button>
        <Button
          disabled={!code}
          onClick={() => code && download(svgDataUrl(code.svg), 'qr-code.svg')}
          className={buttonClass}
        >
          Download SVG
        </Button>
      </div>
    </div>
  );
}
