// /rebrandly-alternative – how reqq.cc compares with Rebrandly's free plan.
// The Rebrandly figures come from its pricing page; when they change, update
// the table and CHECKED together.
import LandingPage, {
  CompareTable,
  Section,
  TextLink,
  type FaqItem,
} from '@/components/LandingPage';
import { pageMetadata } from '@/lib/pageMetadata';

/** When the Rebrandly column was last checked against rebrandly.com/pricing. */
const CHECKED = '16 November 2026';

export const metadata = pageMetadata({
  title: 'Free Rebrandly Alternative – No Monthly Link Limit | reqq.cc',
  description:
    'reqq.cc is a free Rebrandly alternative with no monthly limit on links or QR codes: custom short links, editable destinations and click stats. Open source.',
  path: '/rebrandly-alternative',
});

const FAQ: FaqItem[] = [
  {
    q: 'Is reqq.cc really free, or is there a paid plan later?',
    a: 'It’s free and there are no paid plans. The site is run by one developer and voluntary donations help cover hosting.',
  },
  {
    q: 'How many links and QR codes can I make?',
    a: 'There’s no monthly limit on either. To keep spam out, one person can make up to 10 links a minute.',
  },
  {
    q: 'Do reqq.cc QR codes have a watermark?',
    a: 'No. Every QR code is a plain code you can download as a PNG or an SVG, with nothing added to it.',
  },
  {
    q: 'Can I use my own domain, like Rebrandly offers?',
    a: 'No. Every short link starts with reqq.cc. Branded links on your own domain are what Rebrandly is built for, so if you need them, Rebrandly is the better fit.',
  },
  {
    q: 'Can I move my Rebrandly links to reqq.cc?',
    a: 'Not the links themselves: a rebrand.ly address, or one on your own domain set up in Rebrandly, keeps working only there. Make a new reqq.cc link to the same destination and share that one from now on.',
  },
  {
    q: 'How often can I change where a link goes?',
    a: 'As often as you like, if you made the link while signed in. There’s no monthly allowance of edits.',
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

export default function RebrandlyAlternativePage() {
  return (
    <LandingPage
      title="A free Rebrandly alternative"
      intro="reqq.cc shortens links for free with no monthly limit on links or QR codes. You can change where a link goes and see its click stats without paying for a plan."
      button="Shorten a link"
      faq={FAQ}
    >
      <Section title="reqq.cc and Rebrandly’s free plan side by side">
        <CompareTable
          head={['', 'Rebrandly Free', 'reqq.cc']}
          rows={[
            ['Price', 'Free', 'Free'],
            ['Short links', '10 new links a month', 'No monthly limit'],
            ['Custom names', 'Included', 'Included'],
            [
              'QR codes',
              '10 a month, with a watermark',
              'No limit, no watermark',
            ],
            [
              'Change where a link goes',
              'Listed from the Essentials plan (from $11 a month), 10 edits a month',
              'Free with an account, no monthly allowance',
            ],
            [
              'Click stats',
              'Total clicks, plus details for 100 clicks a month',
              'Free with an account: every click, by day, site, country and device',
            ],
            ['Your own domain', '1 custom domain', 'Not available'],
            ['Source code', 'Not public', 'Open source'],
          ]}
        />
        <p className="text-sm">
          Rebrandly figures are from{' '}
          <TextLink href="https://www.rebrandly.com/pricing">
            Rebrandly’s pricing page
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
            <TextLink href="/qr-code-generator">QR code generator</TextLink>{' '}
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
            A <TextLink href="/utm-builder">UTM link builder</TextLink> for
            campaign links.
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

      <Section title="When Rebrandly is the better choice">
        <p>
          reqq.cc is a small, simple tool. Rebrandly does things it doesn’t,
          and if you need one of these, Rebrandly fits better:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Short links on your own domain, which even its free plan includes.
          </li>
          <li>Making links through an API or from other apps.</li>
          <li>Several people sharing workspaces, with permissions.</li>
          <li>A link-in-bio page, traffic routing and mobile deep links.</li>
          <li>
            An uptime promise and compliance certificates such as SOC 2.
          </li>
        </ul>
      </Section>

      <Section title="Other comparisons">
        <p>
          See also how reqq.cc compares with{' '}
          <TextLink href="/bitly-alternative">Bitly</TextLink> and with{' '}
          <TextLink href="/tinyurl-alternative">TinyURL</TextLink>.
        </p>
      </Section>

      <p className="text-sm text-white/70">
        Rebrandly is a trademark of its owner. reqq.cc is not affiliated with
        or endorsed by Rebrandly.
      </p>
    </LandingPage>
  );
}
