// /link-checker – shows where a link leads without opening it in the
// visitor's browser. A static page: the tool (LinkChecker) runs on the client
// and asks the server to follow the link (the checkLink action).
import LandingPage, {
  Section,
  TextLink,
  type FaqItem,
} from '@/components/LandingPage';
import LinkChecker from '@/components/LinkChecker';
import { pageMetadata } from '@/lib/pageMetadata';

// A check can wait on several slow sites in a row (see linkTrace.ts).
export const maxDuration = 30;

const DESCRIPTION =
  'Paste a short link to see where it really leads before you click: every redirect on the way, the final address and a Google Safe Browsing check. Free, no sign-up.';

export const metadata = pageMetadata({
  title: 'Link Checker – See Where a Short Link Goes | reqq.cc',
  description: DESCRIPTION,
  path: '/link-checker',
});

// https://developers.google.com/search/docs/appearance/structured-data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'reqq.cc link checker',
  url: 'https://reqq.cc/link-checker',
  description: DESCRIPTION,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Expands short links from any URL shortener',
    'Lists every redirect on the way to the final address',
    'Checks the final address with Google Safe Browsing',
    'Your browser never opens the link',
  ],
  publisher: { '@id': 'https://reqq.cc/#organization' },
};

const FAQ: FaqItem[] = [
  {
    q: 'How does the link checker work?',
    a: 'reqq.cc’s server asks for the link the way a browser would, but reads only the reply’s first lines: the status and, if it’s a redirect, the next address. It repeats that until an address answers with a page instead of a redirect, for up to 10 redirects. The pages themselves are never downloaded.',
  },
  {
    q: 'Which short links can it expand?',
    a: 'Links from any shortener that redirects the usual way, which covers Bitly, TinyURL, t.co, reqq.cc and nearly all others. It also works on ordinary links that redirect, like tracking links in emails.',
  },
  {
    q: 'Does a clean result mean the link is safe?',
    a: 'No. Google Safe Browsing lists sites known for phishing, malware and unwanted software, and a new bad site may not be on the list yet. Read the final address yourself too: check that the name is spelled the way you expect and that it’s the site you meant to visit.',
  },
  {
    q: 'Does checking a link count as a click?',
    a: 'On other shorteners it may, since their servers see one request. A reqq.cc link is looked up directly instead of opened, so checking it is not counted as a click.',
  },
  {
    q: 'Why does it say a link doesn’t redirect when my browser ends up somewhere else?',
    a: 'Some pages send visitors on with a script or a tag inside the page, or only after a consent screen. The checker follows redirects made by the server and doesn’t run pages, so it stops at the page that would do that.',
  },
  {
    q: 'Why did an address answer with an error?',
    a: 'Either the link is broken, or the site turns away automated visitors. Some sites answer checkers with “403 Forbidden” while opening normally in a browser.',
  },
  {
    q: 'Is the link I check stored?',
    a: 'No. The link is sent to reqq.cc’s server to be followed, the sites on the way each receive one request from that server, and the last address is sent to Google Safe Browsing. reqq.cc doesn’t save or log the link, and the sites see reqq.cc’s server, not you.',
  },
];

export default function LinkCheckerPage() {
  return (
    <LandingPage
      title="Link checker: see where a link goes"
      intro="Paste a short link to see every address it passes through and where it ends, before you click it. The final address is checked with Google Safe Browsing. Free, with no sign-up."
      tool={<LinkChecker />}
      button="Shorten a link"
      faq={FAQ}
    >
      <script
        type="application/ld+json"
        // "<" escaped so the JSON can never close the script tag early
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <Section title="How to check a link">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Copy the link without opening it: press and hold it on a phone, or
            right-click it on a computer, and choose “Copy link”.
          </li>
          <li>Paste it into the box and press “Check link”.</li>
          <li>
            Read the last address in the list. That is where the link really
            leads.
          </li>
        </ol>
      </Section>

      <Section title="What the result shows">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Every address the link passes through, in order, with the status
            each one answered with (301 and 302 are redirects, 200 is a page).
          </li>
          <li>The final address, where a browser would end up.</li>
          <li>
            Whether Google Safe Browsing reports that address for phishing,
            malware or unwanted software.
          </li>
          <li>
            Whether the link is broken: an address that doesn’t answer, or
            answers with an error.
          </li>
        </ul>
      </Section>

      <Section title="Why check a short link first">
        <p>
          A short link hides its destination, which is what makes it handy and
          also what scammers like about it. A message that says it’s from your
          bank or a parcel service, with a short link in it, is the classic
          case. Checking takes a few seconds and shows the real address
          without your phone or computer ever contacting the site.
        </p>
      </Section>

      <Section title="How reqq.cc keeps its own links clean">
        <p>
          Every link shortened on reqq.cc is checked with Google Safe Browsing
          when it’s made and again every week. A link whose destination turns
          bad is blocked and shows a warning instead of redirecting. Links to
          other URL shorteners can’t be shortened at all, so a reqq.cc link
          never hides a second short link behind it. You can{' '}
          <TextLink href="/url-shortener-without-sign-up">
            shorten a link without signing up
          </TextLink>
          , or see{' '}
          <TextLink href="/bitly-alternative">
            how reqq.cc compares with Bitly
          </TextLink>
          .
        </p>
      </Section>
    </LandingPage>
  );
}
