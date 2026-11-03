import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Link blocked – reqq.cc',
  robots: { index: false },
};

// Shown at reqq.cc/<slug> in place of the redirect (a middleware rewrite) when
// Google Safe Browsing reports the link's destination as unsafe.
export default function BlockedLink() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 text-center text-white">
      <ShieldAlert
        size={128}
        strokeWidth={1.5}
        className="text-yellow mb-6"
        aria-hidden="true"
      />

      <h1 className="font-fredoka-one mb-4 text-5xl">
        This link has been blocked
      </h1>
      <p className="font-poppins text-lg">
        Google Safe Browsing reports the site it leads to as unsafe, for example
        phishing or malware, so reqq.cc no longer sends visitors there.
      </p>
      <p className="font-poppins mt-4 text-lg">
        If this is your link, sign in and change where it leads.
      </p>

      <Link
        href="/"
        className="text-blue font-fredoka-one my-6 inline-block rounded-full border-4 border-black bg-white px-6 py-2 text-4xl transition hover:bg-white/80"
      >
        Go Home
      </Link>
    </div>
  );
}
