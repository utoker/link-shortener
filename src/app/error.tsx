'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="font-fredoka-one mx-auto flex min-h-[50vh] flex-col items-center justify-center text-center text-white">
      <h1 className="mb-4 text-6xl">Something went wrong</h1>
      <p className="font-baloo-thambi mb-8 text-xl">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-yellow font-fredoka-one cursor-pointer rounded-full border-2 border-black px-6 py-2 text-2xl text-black transition hover:bg-yellow/80"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="text-blue font-fredoka-one rounded-full border-2 border-black bg-white px-6 py-2 text-2xl transition hover:bg-white/80"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
