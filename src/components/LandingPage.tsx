// The frame the landing pages share (/bitly-alternative,
// /url-shortener-without-sign-up, /link-click-counter): a heading, an intro,
// a button to the shortener, then the page's own sections and a FAQ.
// Server-rendered text only, in classes the site already has.
import Link from 'next/link';
import s from './LandingPage.module.css';

export interface FaqItem {
  q: string;
  a: React.ReactNode;
}

/** A link inside running text. */
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const className = 'underline underline-offset-2';
  return href.startsWith('/') ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/** The button that sends people to the shortener on the homepage. */
export function ShortenButton({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center">
      <Link
        href="/"
        className={`font-fredoka-one bg-yellow inline-flex items-center rounded-full px-8 py-3 text-xl text-black shadow-xl ${s.cta}`}
      >
        {children}
      </Link>
    </p>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="font-baloo-thambi space-y-3 text-lg text-white/80">
      <h2 className="font-fredoka-one text-yellow text-2xl">{title}</h2>
      {children}
    </section>
  );
}

/** A table whose first column names each row. */
export function CompareTable({
  head,
  rows,
}: {
  head: [string, string, string];
  rows: [string, React.ReactNode, React.ReactNode][];
}) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, a, b]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{a}</td>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LandingPage({
  title,
  intro,
  button,
  faq,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  /** Text of the button to the shortener, shown under the intro and at the end. */
  button: string;
  faq: FaqItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-12 text-white">
      <header className="space-y-2 text-center">
        <h1 className="font-fredoka-one text-yellow text-3xl sm:text-4xl">
          {title}
        </h1>
        <p className="font-baloo-thambi text-lg text-white/80">{intro}</p>
      </header>

      <ShortenButton>{button}</ShortenButton>

      {children}

      <section className="space-y-3">
        <h2 className="font-fredoka-one text-yellow text-2xl">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faq.map(({ q, a }) => (
            <div key={q} className="space-y-1">
              <h3 className="font-fredoka-one text-xl">{q}</h3>
              <p className="font-baloo-thambi text-lg text-white/80">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <ShortenButton>{button}</ShortenButton>
    </div>
  );
}
