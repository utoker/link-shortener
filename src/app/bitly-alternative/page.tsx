// /bitly-alternative – how reqq.cc compares with Bitly's free plan.
// The Bitly figures come from its pricing page; when they change, update the
// table and CHECKED together.
import LandingPage, {
  CompareTable,
  Section,
  TextLink,
  type FaqItem,
} from '@/components/LandingPage';
import { pageMetadata } from '@/lib/pageMetadata';

/** When the Bitly column was last checked against bitly.com/pages/pricing. */
const CHECKED = '16 November 2026';

export const metadata = pageMetadata({
  title: 'Free, Open Source Bitly Alternative – reqq.cc',
  description:
    'reqq.cc is a free Bitly alternative with no ads and no monthly link limit: custom short links, QR codes, editable destinations and click stats. Open source.',
  path: '/bitly-alternative',
});

const FAQ: FaqItem[] = [
  {
    q: 'Is reqq.cc really free, or is there a paid plan later?',
    a: 'It’s free and there are no paid plans. The site is run by one developer and voluntary donations help cover hosting.',
  },
  {
    q: 'How many links can I make?',
    a: 'There’s no monthly limit. To keep spam out, one person can make up to 10 links a minute.',
  },
  {
    q: 'Can I move my Bitly links to reqq.cc?',
    a: 'Not the links themselves: a bit.ly address belongs to Bitly and keeps working only there. Make a new reqq.cc link to the same destination and share that one from now on.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'No. Every short link starts with reqq.cc. If you need links on your own domain, a paid Bitly plan or a shortener you host yourself is the better fit.',
  },
  {
    q: 'Do reqq.cc links show ads before the destination?',
    a: 'No. A short link sends people straight to the destination. The one exception is a link Google Safe Browsing has flagged, which shows a warning instead.',
  },
  {
    q: 'Can I read the code?',
    a: (
      <>
        Yes. reqq.cc is open source and the code is on{' '}
        <TextLink href="https://github.com/utoker/link-shortener">
          GitHub
        </TextLink>
        .
      </>
    ),
  },
];

export default function BitlyAlternativePage() {
  return (
    <LandingPage
      title="A free, open source Bitly alternative"
      intro="reqq.cc shortens links for free, with no ads and no monthly limit. You get custom names, QR codes, links you can point somewhere new and click stats, without paying for a plan."
      button="Shorten a link"
      faq={FAQ}
    >
      <Section title="reqq.cc and Bitly’s free plan side by side">
        <CompareTable
          head={['', 'Bitly Free', 'reqq.cc']}
          rows={[
            ['Price', 'Free, with ads', 'Free, no ads'],
            ['Short links', '5 a month', 'No monthly limit'],
            ['Custom names', '3 a month', 'No monthly limit'],
            ['QR codes', '2 a month', 'No limit'],
            [
              'Change where a link goes',
              'Listed from the Core plan ($10 a month, billed yearly)',
              'Free with an account',
            ],
            [
              'Click stats',
              '“30 days of click & scan data” is listed from the Core plan',
              'Free with an account, kept until you delete the link',
            ],
            ['Source code', 'Not public', 'Open source'],
          ]}
        />
        <p className="text-sm">
          Bitly figures are from{' '}
          <TextLink href="https://bitly.com/pages/pricing">
            Bitly’s pricing page
          </TextLink>{' '}
          as checked on {CHECKED}. Plans change, so check there for today’s
          numbers.
        </p>
      </Section>

      <Section title="What you get with reqq.cc">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Short links with a name you choose, like reqq.cc/my-event, or a
            random six-character one.
          </li>
          <li>
            A QR code for every link, as a PNG or an SVG, plus a{' '}
            <TextLink href="/qr-code-generator">
              QR code generator
            </TextLink>{' '}
            for any text.
          </li>
          <li>
            Links you can point somewhere new after sharing or printing them,
            when you make them while signed in.
          </li>
          <li>
            Click stats by day, site, country and device. See the{' '}
            <TextLink href="/link-click-counter">link click counter</TextLink>.
          </li>
          <li>
            No account needed for a quick link. See{' '}
            <TextLink href="/url-shortener-without-sign-up">
              shortening without sign-up
            </TextLink>
            .
          </li>
          <li>
            A Google Safe Browsing check of every new link, repeated each week.
          </li>
        </ul>
      </Section>

      <Section title="When Bitly is the better choice">
        <p>
          reqq.cc is a small, simple tool. Bitly’s paid plans do things it
          doesn’t, and if you need one of these, Bitly fits better:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Short links on your own domain.</li>
          <li>Making links in bulk or through an API.</li>
          <li>Several people sharing one account, with permissions.</li>
          <li>Landing pages and mobile deep links.</li>
          <li>An uptime promise and a support team.</li>
        </ul>
      </Section>

      <Section title="Other comparisons">
        <p>
          See also how reqq.cc compares with{' '}
          <TextLink href="/tinyurl-alternative">TinyURL</TextLink> and with{' '}
          <TextLink href="/rebrandly-alternative">Rebrandly</TextLink>.
        </p>
      </Section>

      <p className="text-sm text-white/70">
        Bitly is a trademark of Bitly, Inc. reqq.cc is not affiliated with or
        endorsed by Bitly.
      </p>
    </LandingPage>
  );
}
