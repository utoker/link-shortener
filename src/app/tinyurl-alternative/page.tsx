// /tinyurl-alternative – how reqq.cc compares with TinyURL's free plan.
// The TinyURL figures come from its pricing page; when they change, update
// the table and CHECKED together.
import LandingPage, {
  CompareTable,
  Section,
  TextLink,
  type FaqItem,
} from '@/components/LandingPage';
import { pageMetadata } from '@/lib/pageMetadata';

/** When the TinyURL column was last checked against tinyurl.com/app/pricing. */
const CHECKED = '16 November 2026';

export const metadata = pageMetadata({
  title: 'Free TinyURL Alternative – Editable Links, Click Stats | reqq.cc',
  description:
    'reqq.cc is a free TinyURL alternative with no monthly link limit: custom short links you can edit and delete, click stats and QR codes. No ads, open source.',
  path: '/tinyurl-alternative',
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
    q: 'Can I change or delete a link after making it?',
    a: 'Yes, if you made it while signed in. You can point it somewhere new or delete it from your list of links. Links made without an account can’t be changed.',
  },
  {
    q: 'Can I move my TinyURL links to reqq.cc?',
    a: 'Not the links themselves: a tinyurl.com address belongs to TinyURL and keeps working only there. Make a new reqq.cc link to the same destination and share that one from now on.',
  },
  {
    q: 'Do reqq.cc links expire?',
    a: 'No. A link works until you delete it. The one exception is a link Google Safe Browsing flags as unsafe, which shows a warning instead of redirecting.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'No. Every short link starts with reqq.cc. If you need links on your own domain, TinyURL or a shortener you host yourself is the better fit.',
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

export default function TinyUrlAlternativePage() {
  return (
    <LandingPage
      title="A free TinyURL alternative"
      intro="reqq.cc shortens links for free with no monthly limit. Unlike TinyURL’s free plan, you can change where a link goes, delete it and see how often it’s clicked, without paying for a plan."
      button="Shorten a link"
      faq={FAQ}
    >
      <Section title="reqq.cc and TinyURL’s free plan side by side">
        <CompareTable
          head={['', 'TinyURL Free', 'reqq.cc']}
          rows={[
            ['Price', 'Free', 'Free'],
            ['Short links', '30 a month', 'No monthly limit'],
            ['Custom names', 'Included', 'Included'],
            [
              'Change where a link goes',
              'Listed from the Pro plan ($9 a month, billed yearly)',
              'Free with an account',
            ],
            [
              'Delete a link',
              'Listed from the Pro plan',
              'Free with an account',
            ],
            [
              'Click stats',
              'Listed from the Pro plan',
              'Free with an account, kept until you delete the link',
            ],
            ['Link expiry', 'Never expires', 'Never expires'],
            ['Your own domain', '1 branded domain', 'Not available'],
            ['Source code', 'Not public', 'Open source'],
          ]}
        />
        <p className="text-sm">
          TinyURL figures are from{' '}
          <TextLink href="https://tinyurl.com/app/pricing">
            TinyURL’s pricing page
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
            Links you can point somewhere new or delete after sharing them,
            when you make them while signed in.
          </li>
          <li>
            Click stats by day, site, country and device. See the{' '}
            <TextLink href="/link-click-counter">link click counter</TextLink>.
          </li>
          <li>
            A QR code for every link, as a PNG or an SVG, plus a{' '}
            <TextLink href="/qr-code-generator">QR code generator</TextLink>{' '}
            for any text.
          </li>
          <li>
            No account needed for a quick link. See{' '}
            <TextLink href="/url-shortener-without-sign-up">
              shortening without sign-up
            </TextLink>
            .
          </li>
          <li>
            A Google Safe Browsing check of every new link, repeated each week,
            and a <TextLink href="/link-checker">link checker</TextLink> to see
            where any short link leads.
          </li>
        </ul>
      </Section>

      <Section title="When TinyURL is the better choice">
        <p>
          reqq.cc is a small, simple tool. TinyURL does things it doesn’t, and
          if you need one of these, TinyURL fits better:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Short links on your own domain, which its free plan includes.</li>
          <li>Making tens of thousands of links at once on its Bulk plans.</li>
          <li>Links that expire on a date you set.</li>
          <li>
            An uptime promise and a support team, on its Enterprise plan.
          </li>
          <li>
            A name nearly everyone recognises: TinyURL has been around since
            2002.
          </li>
        </ul>
      </Section>

      <Section title="Other comparisons">
        <p>
          See also how reqq.cc compares with{' '}
          <TextLink href="/bitly-alternative">Bitly</TextLink> and with{' '}
          <TextLink href="/rebrandly-alternative">Rebrandly</TextLink>.
        </p>
      </Section>

      <p className="text-sm text-white/70">
        TinyURL is a trademark of its owner. reqq.cc is not affiliated with or
        endorsed by TinyURL.
      </p>
    </LandingPage>
  );
}
