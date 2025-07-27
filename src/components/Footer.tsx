import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Top row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Brand blurb */}
          <div className="max-w-2xl text-sm text-white/70">
            <p>
              <strong className="text-white">reqq.cc</strong> — a fast, free URL
              shortener. Donations help cover hosting, domain, and monitoring.
            </p>
          </div>

          {/* Donate */}
          <div className="shrink-0">
            <Link
              href="https://ko-fi.com/utoker" // or /donate if you host Stripe
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/10"
              aria-label="Donate to help keep reqq.cc free"
            >
              <span aria-hidden>❤️</span> Donate
            </Link>
          </div>
        </div>

        {/* Link rows */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-white/80 sm:grid-cols-3 md:grid-cols-6">
          <Link href="/protected/about" className="hover:underline">
            About
          </Link>
          <Link href="/protected/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/protected/privacy" className="hover:underline">
            Privacy
          </Link>
          {/* <Link href="/report" className="hover:underline">Report abuse</Link> */}
          <a href="mailto:utoker1@gmail.com" className="hover:underline">
            Contact
          </a>
          {/* <Link href="/status" className="hover:underline">Status</Link> */}
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/60 md:flex-row md:items-center">
          <p>© {year} reqq.cc — All rights reserved.</p>
          <p>
            By using reqq.cc you agree to our{' '}
            <Link href="/protected/terms" className="underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/protected/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
