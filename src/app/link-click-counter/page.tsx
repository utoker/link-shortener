// /link-click-counter – what the click stats of a short link show (the stats
// page itself is /links/<slug>/stats, for the link's owner only).
import LandingPage, {
  Section,
  TextLink,
  type FaqItem,
} from '@/components/LandingPage';
import { pageMetadata } from '@/lib/pageMetadata';

export const metadata = pageMetadata({
  title: 'Free Link Click Counter – Count Clicks on Any Link | reqq.cc',
  description:
    'Count the clicks on any link for free: shorten it and see clicks by day, site, country and device, with QR scans counted too. No visitor IP addresses stored.',
  path: '/link-click-counter',
});

const FAQ: FaqItem[] = [
  {
    q: 'Is the click counter free?',
    a: 'Yes. Click stats come with the free account, and there are no paid plans or ads.',
  },
  {
    q: 'Do I need an account to count clicks?',
    a: 'Yes. Stats are private to the link’s owner, so the link has to be made while signed in. An account needs only an email address and a password.',
  },
  {
    q: 'Are bots counted?',
    a: 'No. Link-preview bots (the ones that fetch a link when you paste it into WhatsApp, Slack or Facebook), automated link checkers and scripts are sent on to the destination but not counted.',
  },
  {
    q: 'Can I see who clicked my link?',
    a: 'No. reqq.cc doesn’t store IP addresses or browser details, so a click can’t be traced back to a person. You see totals: how many clicks, from which sites and countries, on which kind of device.',
  },
  {
    q: 'How far back do the stats go?',
    a: 'Click details are kept until you delete the link or your account. You can look at the last 7, 30 or 90 days, or at all time.',
  },
  {
    q: 'Can I count scans of a QR code?',
    a: 'Yes. Download the QR code from your short link (the “QR code” button next to it). Scans of that code are counted as their own source, separate from clicks on the link.',
  },
  {
    q: 'Who can see my link’s stats?',
    a: 'Only you, while signed in. There’s no public stats page.',
  },
];

export default function LinkClickCounterPage() {
  return (
    <LandingPage
      title="A free link click counter"
      intro="Want to know how often a link is clicked? Shorten it with reqq.cc and every click on the short link is counted, by day, site, country and device, without storing anything that identifies a visitor."
      button="Make a link to count"
      faq={FAQ}
    >
      <Section title="How to count clicks on a link">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Sign up or sign in on the{' '}
            <TextLink href="/">reqq.cc homepage</TextLink>. It’s free.
          </li>
          <li>Paste the link you want to count and shorten it.</li>
          <li>
            Share the short link instead of the long one: in a post, an email,
            a bio or a QR code.
          </li>
          <li>
            Open the link’s stats from your list of links to see the clicks
            come in.
          </li>
        </ol>
      </Section>

      <Section title="What the stats show">
        <ul className="list-disc space-y-1 pl-5">
          <li>The total number of clicks.</li>
          <li>
            A chart of clicks per day, week or month, for the last 7, 30 or 90
            days or all time.
          </li>
          <li>
            The sites the clicks came from, like linkedin.com or x.com. Only
            the site’s name is kept, never the full page address.
          </li>
          <li>The countries the clicks came from.</li>
          <li>The kind of device: phone, tablet or computer.</li>
          <li>
            Scans of the link’s QR code, counted separately from other clicks.
          </li>
        </ul>
      </Section>

      <Section title="Counting without tracking people">
        <p>
          For each click reqq.cc stores the time, the referring site’s name,
          the country and the device type. It doesn’t store the visitor’s IP
          address or browser details and sets no cookie on the people who
          click. That’s enough to tell you whether your newsletter or your
          poster worked better, and not enough to follow anyone around. The{' '}
          <TextLink href="/privacy">Privacy Policy</TextLink> lists exactly
          what is kept.
        </p>
      </Section>

      <Section title="Counting clicks on printed QR codes">
        <p>
          Make the QR code from your short link, not from the long one. Scans
          are then counted, and if the destination ever changes you can point
          the short link somewhere new and the printed code keeps working. For
          a plain code that isn’t counted, there’s the{' '}
          <TextLink href="/qr-code-generator">QR code generator</TextLink>.
        </p>
      </Section>
    </LandingPage>
  );
}
