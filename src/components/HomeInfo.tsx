// What reqq.cc is and how it works, in words: the page's main heading and a
// FAQ below the feature icons, so search engines (and new visitors) can tell
// what the site does. Below the fold, so the first paint doesn't change.
// It uses only classes the site already has: Tailwind builds one stylesheet
// for every page, and the homepage can't paint until it has loaded, so each
// new class would slow the first paint for everyone.

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Is reqq.cc really free?',
    a: 'Yes. There are no paid plans and no ads. Voluntary donations help cover hosting.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Anyone can shorten links. A free account lets you see all your links, change where they lead, delete them and see how often they’re clicked.',
  },
  {
    q: 'Do short links expire?',
    a: 'No. A short link keeps working until it’s deleted.',
  },
  {
    q: 'Can I choose my own short link?',
    a: 'Yes. Type a custom name with letters, numbers, dashes or underscores (up to 64 characters). If nobody has it yet, it’s yours.',
  },
  {
    q: 'Can I change where a short link goes?',
    a: 'Yes, if you made it while signed in. The short link stays the same, so links you’ve shared and QR codes you’ve printed keep working.',
  },
  {
    q: 'How do I make a QR code for a link?',
    a: (
      <>
        Shorten the link, then press “QR code” next to it. You can download it
        as a PNG or an SVG for print. For a code that holds any link or text
        without shortening it, use the{' '}
        <a href="/qr-code-generator" className="underline underline-offset-2">
          free QR code generator
        </a>
        .
      </>
    ),
  },
  {
    q: 'Are reqq.cc links safe to open?',
    a: 'Every new link is checked with Google Safe Browsing and all links are checked again each week. If Google flags a site, its short link shows a warning instead of sending people there.',
  },
  {
    q: 'What do you record when someone clicks a link?',
    a: 'For links made while signed in, the owner sees how many clicks there were and for each one the day, the site it came from, the country and the device type. IP addresses and browser details are never stored, so a click can’t be traced back to a person.',
  },
  {
    q: 'Is reqq.cc open source?',
    a: (
      <>
        Yes. The code is on{' '}
        <a
          href="https://github.com/utoker/link-shortener"
          className="underline underline-offset-2"
        >
          GitHub
        </a>
        .
      </>
    ),
  },
];

export default function HomeInfo() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 px-4 pb-12 text-white">
      <header className="space-y-2 text-center">
        <h1 className="font-fredoka-one text-yellow text-3xl sm:text-4xl">
          Free URL shortener with custom links, QR codes and click stats
        </h1>
        <p className="font-baloo-thambi text-lg text-white/80">
          reqq.cc turns long links into short ones you can share anywhere. It’s
          free, has no ads and doesn’t need an account. Sign up if you want to
          manage your links and see how often they’re clicked.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-fredoka-one text-yellow text-2xl">
          How to shorten a link
        </h2>
        <ol className="font-baloo-thambi list-decimal space-y-1 pl-5 text-lg">
          <li>Paste your long link into the box at the top of the page.</li>
          <li>If you like, type a custom name, like reqq.cc/my-event.</li>
          <li>
            Press the button. Your short link is ready to copy and share, with a
            QR code if you need one.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-fredoka-one text-yellow text-2xl">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="space-y-1">
              <h3 className="font-fredoka-one text-xl">{q}</h3>
              <p className="font-baloo-thambi text-lg text-white/80">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
