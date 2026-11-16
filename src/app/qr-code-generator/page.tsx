// /qr-code-generator – a QR code for any link or text, made in the browser.
// A static page: only the tool itself (QrGenerator) runs on the client.
import type { Metadata } from 'next';
import Link from 'next/link';
import QrGenerator from '@/components/QrGenerator';

const TITLE = 'Free QR Code Generator – No Sign-Up, No Expiry | reqq.cc';
const DESCRIPTION =
  'Make a QR code for any link or text. Free, with no sign-up, no ads and no watermark. Codes never expire. Download as PNG or SVG.';

// The site's share image (app/opengraph-image.png). A page that sets its own
// openGraph loses the inherited one, so it's named here.
const SHARE_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'reqq.cc: Shorten your links with ease. Free, fast and private.',
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/qr-code-generator' },
  // Set in full: a page's openGraph replaces the layout's, it isn't merged.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/qr-code-generator',
    siteName: 'reqq.cc',
    type: 'website',
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

// https://developers.google.com/search/docs/appearance/structured-data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'reqq.cc QR code generator',
  url: 'https://reqq.cc/qr-code-generator',
  description: DESCRIPTION,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'QR codes for any link or text',
    'Download as PNG or SVG',
    'Codes never expire and have no scan limit',
    'Made in the browser: nothing typed is sent to a server',
  ],
  publisher: { '@id': 'https://reqq.cc/#organization' },
};

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Is the QR code generator really free?',
    a: 'Yes. There’s no sign-up, no ads, no watermark and no limit on how many codes you make. Voluntary donations help cover hosting.',
  },
  {
    q: 'Do the QR codes expire?',
    a: 'No. The code holds your link or text itself and doesn’t pass through reqq.cc, so it works for as long as your link does. There’s no scan limit either.',
  },
  {
    q: 'Can I change where a QR code leads after I’ve printed it?',
    a: (
      <>
        Not a code made on this page: what you typed is fixed in its pattern. If
        the destination might change,{' '}
        <Link href="/" className="underline underline-offset-2">
          shorten the link
        </Link>{' '}
        while signed in and press “QR code” next to it. That code points at the
        short link, and you can change where the short link goes at any time.
      </>
    ),
  },
  {
    q: 'Should I download the PNG or the SVG?',
    a: 'The PNG (1024 × 1024 pixels) suits websites, slides and documents. The SVG stays sharp at any size, so it’s the one for posters, packaging and anything else you print.',
  },
  {
    q: 'What can I put in a QR code?',
    a: 'Any link or text of up to 2,000 characters. Shorter is better: the less a code holds, the bigger its squares and the easier it is to scan from a distance.',
  },
  {
    q: 'Is what I type private?',
    a: 'Yes. The code is drawn in your browser. The link or text you type is never sent to reqq.cc or anywhere else.',
  },
];

export default function QrCodeGeneratorPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-12 text-white">
      <script
        type="application/ld+json"
        // "<" escaped so the JSON can never close the script tag early
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <header className="space-y-2 text-center">
        <h1 className="font-fredoka-one text-yellow text-3xl sm:text-4xl">
          Free QR code generator
        </h1>
        <p className="font-baloo-thambi text-lg text-white/80">
          Type a link or any text and download its QR code as a PNG or an SVG.
          No sign-up, no ads and no watermark, and the code never expires.
        </p>
      </header>

      <QrGenerator />

      <section className="space-y-3">
        <h2 className="font-fredoka-one text-yellow text-2xl">
          How to make a QR code
        </h2>
        <ol className="font-baloo-thambi list-decimal space-y-1 pl-5 text-lg">
          <li>Type or paste your link or text into the box.</li>
          <li>Check the code that appears. Scan it with your phone to be sure.</li>
          <li>
            Download it as a PNG for screens or as an SVG for print.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-fredoka-one text-yellow text-2xl">
          A QR code you can change later
        </h2>
        <p className="font-baloo-thambi text-lg text-white/80">
          A code made here always leads to exactly what you typed. For a menu,
          a flyer or a product label, where the destination may change after
          printing, make the code from a reqq.cc short link instead:{' '}
          <Link href="/" className="underline underline-offset-2">
            shorten your link
          </Link>{' '}
          while signed in, then press “QR code” next to it. You can point the
          short link somewhere new whenever you like and the printed code keeps
          working. You also see how often the link is used.
        </p>
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
    </div>
  );
}
