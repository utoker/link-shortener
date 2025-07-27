export const metadata = {
  title: 'Terms of Service – reqq.cc',
  description:
    'Terms of Service for using reqq.cc, including acceptable use and moderation.',
};

export default function TermsPage() {
  const lastUpdated = '2025-07-27'; // update when you change the terms

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-neutral-400">Last updated: {lastUpdated}</p>
      </header>

      <section className="space-y-3">
        <p>
          Welcome to <strong>reqq.cc</strong> (the “Service”). By using the
          Service, you agree to these Terms. If you don’t agree, please don’t
          use reqq.cc.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1) What we provide</h2>
        <p>
          reqq.cc is a free URL shortener. You can create short links that
          redirect to destinations you provide. An optional account lets you
          view and manage your links. There are no paid tiers; funding is via
          voluntary donations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2) Acceptable use</h2>
        <p>You agree not to use reqq.cc to create or share links that:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Violate any law or third‑party rights (including IP/copyright).
          </li>
          <li>
            Contain or distribute malware, spyware, or attempt credential theft.
          </li>
          <li>
            Facilitate phishing, scams, spam, or deceptive/misattributed
            content.
          </li>
          <li>
            Incite violence, harassment, or hate; or sexual content involving
            minors.
          </li>
          <li>Bypass paywalls/DRM or encourage illegal activity.</li>
        </ul>
        <p>
          We may remove links, block destinations or domains, rate‑limit usage,
          or suspend accounts to protect users and comply with law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          3) Your content & responsibility
        </h2>
        <p>
          You are responsible for the destinations you link to and for complying
          with applicable laws. You retain rights to your content; you grant us
          a limited license to process and display redirects for operating the
          Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4) Donations</h2>
        <p>
          Donations are optional and support hosting/maintenance. Donations are
          not a purchase of goods or services. See our{' '}
          <a className="underline" href="/about">
            About
          </a>{' '}
          page and the{' '}
          <a className="underline" href="/privacy">
            Privacy Policy
          </a>{' '}
          for details. Refunds are generally not provided except for duplicate,
          accidental, or unauthorized charges—contact{' '}
          <a className="underline" href="mailto:support@reqq.cc">
            support@reqq.cc
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5) Accounts</h2>
        <p>
          Keep your credentials secure and notify us of suspected unauthorized
          use. We may deactivate accounts that are inactive or violate these
          Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6) Takedowns & reporting</h2>
        <p>
          Report abuse to{' '}
          <a className="underline" href="mailto:support@reqq.cc">
            support@reqq.cc
          </a>{' '}
          with the short URL and details. We respond promptly and may cooperate
          with lawful requests from authorities.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7) Disclaimers</h2>
        <p>
          The Service is provided “as is” without warranties. We don’t guarantee
          uninterrupted or error‑free operation, or the safety/legality of
          third‑party destinations you visit via short links.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">8) Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, reqq.cc and its operator are
          not liable for indirect, incidental, special, consequential, or
          exemplary damages, or for loss of profits, data, or goodwill arising
          from your use of the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">9) Changes</h2>
        <p>
          We may update these Terms. Material changes will be posted here with a
          new “Last updated” date. Continued use after changes means you accept
          them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">10) Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of Florida, USA,
          without regard to conflict‑of‑laws principles.
        </p>
      </section>

      <footer className="border-t border-white/10 pt-6 text-sm text-neutral-400">
        <p>
          Questions? Email{' '}
          <a className="underline" href="mailto:support@reqq.cc">
            support@reqq.cc
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
