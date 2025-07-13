// app/not-found.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-darkBlue mx-auto flex flex-col items-center justify-center text-white">
      {/* <h1 className="font-baloo-thambi mb-4 text-9xl">404</h1> */}

      <div className="mb-6">
        <Image
          src="/images/sad-browser.svg"
          alt="Sad Browser"
          width={480}
          height={480}
          priority
          className="h-auto w-80 md:w-96"
        />
      </div>

      <div className="font-fredoka-one text-center">
        <h2 className="mb-2 text-8xl">Oops!</h2>
        <p className="max-w-6xl text-5xl">
          We can’t find the page you’re looking for.
        </p>
      </div>

      <Link
        href="/"
        className="text-blue font-fredoka-one mt-6 inline-block rounded-full border-4 border-black bg-white px-6 py-2 text-4xl transition hover:bg-white/80"
      >
        Go Home
      </Link>
    </div>
  );
}

// This file is used to handle 404 errors in a Next.js application.
