'use client';

import Link from 'next/link';

type Props = { className?: string };

export default function DonateButton({ className = '' }: Props) {
  return (
    <Link
      href="https://ko-fi.com/utoker" // or /donate
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Donate to help keep reqq.cc free"
      className={[
        'inline-flex items-center gap-2 rounded-full border',
        // size scales up on bigger screens
        'h-12 w-28 cursor-pointer rounded-full border-2 border-black sm:h-24 sm:w-56 sm:border-4',
        // style
        'f bg-transparent shadow-sm transition-colors hover:bg-white/10',
        className,
      ].join(' ')}
    >
      <div className="mx-auto flex items-center gap-2">
        <span aria-hidden className="font-fredoka-one text-lg sm:text-4xl">
          ❤️
        </span>
        {/* show text on small-and-up (xs is not a default breakpoint) */}
        <span className="font-fredoka-one hidden text-lg sm:inline sm:text-4xl">
          Donate
        </span>
      </div>
    </Link>
  );
}
