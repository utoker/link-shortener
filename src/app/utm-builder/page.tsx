// /utm-builder – adds campaign (UTM) tags to a link, in the browser.
// A static page: only the tool itself (UtmBuilder) runs on the client.
import LandingPage, {
  Section,
  TextLink,
  type FaqItem,
} from '@/components/LandingPage';
import UtmBuilder from '@/components/UtmBuilder';
import { pageMetadata } from '@/lib/pageMetadata';

const DESCRIPTION =
  'Add UTM tags to any link so your analytics shows which campaign each visit came from. Free, no sign-up, built in your browser. Shorten the result in one click.';

export const metadata = pageMetadata({
  title: 'Free UTM Link Builder – Campaign URL Generator | reqq.cc',
  description: DESCRIPTION,
  path: '/utm-builder',
});

// https://developers.google.com/search/docs/appearance/structured-data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'reqq.cc UTM link builder',
  url: 'https://reqq.cc/utm-builder',
  description: DESCRIPTION,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Adds utm_source, utm_medium, utm_campaign, utm_term and utm_content to a link',
    'Keeps the link’s own parameters and replaces tags it already has',
    'Hands the tagged link to the shortener in one click',
    'Built in the browser: nothing typed is sent to a server',
  ],
  publisher: { '@id': 'https://reqq.cc/#organization' },
};

const FAQ: FaqItem[] = [
  {
    q: 'What is a UTM tag?',
    a: 'A short label added to the end of a link, like utm_source=newsletter. It doesn’t change the page people land on. Your analytics tool reads it and files the visit under that source, medium and campaign.',
  },
  {
    q: 'Which tags do I need?',
    a: 'Source at least. Google recommends always filling in source, medium and campaign together, so every visit can be sorted the same way. Term and content are optional extras.',
  },
  {
    q: 'Does it work with tools other than Google Analytics?',
    a: 'Yes. The utm_ tags started with Google Analytics but Plausible, Matomo, Fathom, Adobe Analytics, HubSpot and most other tools read them too.',
  },
  {
    q: 'Do capital letters matter?',
    a: 'Yes. Most analytics tools treat “Newsletter” and “newsletter” as two different sources. Pick one style, lowercase with underscores is the usual one, and stick to it.',
  },
  {
    q: 'My link already has parameters. Is that a problem?',
    a: 'No. The tags are added after the link’s own parameters, and anything after a # stays at the end. UTM tags the link already had are replaced with the ones you type.',
  },
  {
    q: 'Should I tag links inside my own website?',
    a: 'No. A tagged link starts a new visit in most analytics tools, so tagging internal links hides where the visitor really came from. Use tags only on links that lead to your site from somewhere else.',
  },
  {
    q: 'Is what I type private?',
    a: 'Yes. The tagged link is put together in your browser and nothing you type is sent to reqq.cc. Only if you press “Shorten it” and then shorten the link is it saved, as the destination of your short link.',
  },
];

export default function UtmBuilderPage() {
  return (
    <LandingPage
      title="Free UTM link builder"
      intro="Add campaign tags to a link so your analytics can tell which post, email or ad each visit came from. No sign-up and no ads, and the long tagged link can be shortened in one click."
      tool={<UtmBuilder />}
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

      <Section title="How to build a UTM link">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Paste the link to the page you want people to land on.</li>
          <li>
            Fill in the source, and the medium and campaign if you use them.
          </li>
          <li>
            Copy the tagged link, or press “Shorten it” to turn it into a
            short link first.
          </li>
          <li>Share that link in the place the tags describe, and only there.</li>
        </ol>
      </Section>

      <Section title="What each tag means">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Source</strong> (utm_source): where the link is placed, like
            newsletter, linkedin or google.
          </li>
          <li>
            <strong>Medium</strong> (utm_medium): the kind of channel, like
            email, social or cpc for paid ads.
          </li>
          <li>
            <strong>Campaign</strong> (utm_campaign): the promotion the link
            belongs to, like spring_sale.
          </li>
          <li>
            <strong>Term</strong> (utm_term): the keyword of a paid search ad.
          </li>
          <li>
            <strong>Content</strong> (utm_content): which of several links or
            ads it was, like header_button or footer_link.
          </li>
        </ul>
      </Section>

      <Section title="Why shorten a tagged link">
        <p>
          A link with five tags is long and looks untidy in a post or on a
          flyer. A short link hides the tags without losing them: it sends
          people on to the full tagged link, so your analytics still sees every
          tag. Make the short link while signed in and you also get reqq.cc’s
          own <TextLink href="/link-click-counter">click counter</TextLink>,
          which counts every click, including the ones your analytics misses
          because of ad blockers. For print, turn the short link into a{' '}
          <TextLink href="/qr-code-generator">QR code</TextLink>.
        </p>
      </Section>

      <Section title="Tips for clean campaign data">
        <ul className="list-disc space-y-1 pl-5">
          <li>Use lowercase everywhere.</li>
          <li>Use underscores or hyphens instead of spaces.</li>
          <li>
            Keep a list of the names you use, so “newsletter” doesn’t turn into
            “email_list” next month.
          </li>
          <li>
            Make one tagged link per place you share it, so the numbers can be
            told apart.
          </li>
        </ul>
      </Section>
    </LandingPage>
  );
}
