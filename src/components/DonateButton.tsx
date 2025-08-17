'use client';

import Link from 'next/link';
import DonateIcon from '@/icons/donate-icon.png';
import Image from 'next/image';

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
       
        'h-12 w-32 cursor-pointer rounded-full border-2 border-black sm:h-20 sm:w-56 sm:border-4',
        
        'f bg-transparent shadow-sm transition-colors hover:bg-white/10',
        className,
      ].join(' ')}
    >
      <div className="mx-auto flex items-center gap-2 h-12 w-32 sm:h-16 sm:w-52  ">
        
        <Image src={DonateIcon} alt="Donate Icon" className="sm:ml-4 h-9 w-8 shrink-0 sm:h-full sm:w-auto" />

        {/* show text on small-and-up (xs is not a default breakpoint) */}
        <span className="font-fredoka-one text-xl sm:text-3xl">Donate</span>
      </div>
    </Link>
  );
}
