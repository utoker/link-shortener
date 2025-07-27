export const metadata = {
  title: 'Privacy Policy – reqq.cc',
  description:
    'Privacy Policy describing what data reqq.cc collects, why, and your choices.',
};

export default function PrivacyPage() {
  const lastUpdated = '2025-07-27'; // update when you change the policy

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-neutral-400">Last updated: {lastUpdated}</p>
      </header>

      <section className="space-y-3">
        <p>
          This Policy explains what information <strong>reqq.cc</strong>{' '}
          collects, how it’s used, and your choices. We keep data minimal and
          use it only to operate, secure, and improve the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account data</strong> (optional): email address and basic
            profile info if you sign in to manage your links.
          </li>
          <li>
            <strong>Link data</strong>: the destination URL, short slug,
            timestamps, and limited metrics (e.g., click counts).
          </li>
          <li>
            <strong>Technical logs</strong>: IP address, user‑agent, referrer,
            and request metadata captured by our infrastructure for security,
            rate‑limiting, and abuse prevention.
          </li>
          <li>
            <strong>Cookies/local storage</strong>: used to support
            authentication and basic preferences.
          </li>
          <li>
            <strong>Donations</strong>: if you donate, payment processing is
            handled by Ko‑fi/Stripe. We receive confirmation of the donation and
            basic donor info (e.g., name/email if you choose to share), but we
            do not store card numbers or other sensitive payment details.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How we use information</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide the Service and maintain functionality.</li>
          <li>Secure the Service (prevent abuse, spam, and fraud).</li>
          <li>
            Communicate with you about your account or reports you submit.
          </li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sharing</h2>
        <p>
          We do not sell personal information. We share data only with service
          providers who help us operate (e.g., hosting, email, payments) under
          appropriate safeguards, or when required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data retention</h2>
        <p>
          We retain account and link data while your account is active and for a
          reasonable period thereafter. Technical logs are kept for a limited
          time for security and diagnostics, then deleted or anonymized.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your choices</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>You can use the Service without an account.</li>
          <li>Delete your links or request account deletion at any time.</li>
          <li>
            Opt out of non‑essential emails (we may still send transactional
            messages, like security notices).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Security</h2>
        <p>
          We use reasonable technical and organizational measures to protect
          information. No system is perfectly secure, and we encourage strong
          passwords and prudent link sharing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Children</h2>
        <p>
          The Service is not directed to children under 13. If you believe a
          child has provided personal information, contact us and we’ll remove
          it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">International users</h2>
        <p>
          The Service is operated in the United States. If you access it from
          other regions, you consent to processing in the U.S. Subject to local
          law, you may have rights to access, correct, or delete certain
          data—contact us to exercise these rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Changes</h2>
        <p>
          We may update this Policy. Material changes will be posted here with a
          new “Last updated” date.
        </p>
      </section>
    </main>
  );
}
