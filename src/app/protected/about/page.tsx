export const metadata = {
  title: 'About – reqq.cc',
  description:
    'What reqq.cc is, how it works, acceptable use, and how to support the project.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">About reqq.cc</h1>
        <p className="text-sm text-white/70">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What is it?</h2>
        <p>
          <strong>reqq.cc</strong> is a fast, free URL shortener I maintain as a
          solo developer. Paste a long link, optionally customize the slug, and
          share the short link. There are no paid tiers—keeping it simple and
          useful is the goal.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Paste a long URL and create your short link.</li>
          <li>
            Share the short link; it redirects to your original destination.
          </li>
          <li>Sign in to view/manage your links (optional).</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Funding & donations</h2>
        <p>
          The service is funded by <strong>voluntary donations</strong> from
          users who want to help cover costs (domain, hosting, monitoring).
          Donations are optional and
          <em> not a purchase of goods or services</em>.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://ko-fi.com/utoker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white/10"
          >
            ❤️ Donate via Ko‑fi
          </a>
          {/* If you later add Stripe Checkout, link to /donate instead */}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Acceptable use</h2>
        <p>
          To keep reqq.cc safe and legal, creating links that point to the
          following content or uses is not allowed:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Illegal content; harassment or incitement to violence.</li>
          <li>Phishing, malware, spyware, or attempts to steal credentials.</li>
          <li>Spam, bulk unsolicited messaging, or deceptive redirects.</li>
          <li>
            Sexual content involving minors; non‑consensual intimate imagery.
          </li>
          <li>Infringement of intellectual property rights.</li>
        </ul>
        <p>
          We may remove links, block domains, or suspend accounts that violate
          these rules.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Report abuse</h2>
        <p>
          If a reqq.cc link points to something illegal or harmful, email{' '}
          <a className="underline" href="mailto:utoker1@gmail.com">
            utoker1@gmail.com
          </a>{' '}
          with the full short URL and a brief description. I review reports
          promptly and take action when warranted.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Refunds for donations</h2>
        <p>
          Donations help cover ongoing costs and are generally{' '}
          <strong>non‑refundable</strong>. If you made a duplicate, accidental,
          or unauthorized donation, contact{' '}
          <a className="underline" href="mailto:utoker1@gmail.com">
            utoker1@gmail.com
          </a>{' '}
          within 7 days and I’ll do my best to help.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Privacy</h2>
        <p>
          Basic technical logs are kept to operate the service and prevent
          abuse. For details on what’s collected and how it’s used, see the{' '}
          <a className="underline" href="/privacy">
            Privacy Policy
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <ul className="space-y-1">
          <li>
            Email:{' '}
            <a className="underline" href="mailto:utoker1@gmail.com">
              utoker1@gmail.com
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
