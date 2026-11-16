// /url-shortener-without-sign-up – what works without an account and what an
// account adds.
import LandingPage, {
  CompareTable,
  Section,
  TextLink,
  type FaqItem,
} from '@/components/LandingPage';
import { pageMetadata } from '@/lib/pageMetadata';

export const metadata = pageMetadata({
  title: 'URL Shortener Without Sign-Up – Free, No Ads | reqq.cc',
  description:
    'Shorten a link without an account: paste it, pick a custom name if you like and get a short link and QR code. Free, no ads, no email needed.',
  path: '/url-shortener-without-sign-up',
});

const FAQ: FaqItem[] = [
  {
    q: 'Do I have to give an email address?',
    a: 'No. Without an account, reqq.cc asks for nothing but the link you want to shorten.',
  },
  {
    q: 'Do links made without an account expire?',
    a: 'No. They keep working like any other reqq.cc link.',
  },
  {
    q: 'Can I edit or delete a link I made without an account?',
    a: 'No. A link made without an account has no owner, so it can’t be changed afterwards. If the destination might change, or you may want to remove the link one day, sign up first. It’s free.',
  },
  {
    q: 'Can I choose a custom name without signing up?',
    a: 'Yes. Type a name with letters, numbers, dashes or underscores (up to 64 characters). If nobody has it yet, it’s yours.',
  },
  {
    q: 'Is there a limit?',
    a: 'There’s no monthly limit. To keep spam out, one person can make up to 10 links a minute.',
  },
  {
    q: 'What do you record when I shorten a link without an account?',
    a: (
      <>
        The link, its short name, when it was made and a total click count.
        Like any website, the servers keep short-lived technical logs to stop
        abuse. The{' '}
        <TextLink href="/privacy">Privacy Policy</TextLink> has the details.
      </>
    ),
  },
];

export default function NoSignUpPage() {
  return (
    <LandingPage
      title="A URL shortener without sign-up"
      intro="Paste a long link and get a short one. No account, no email address and no ads. A free account is there if you later want to manage your links."
      button="Shorten a link now"
      faq={FAQ}
    >
      <Section title="How to shorten a link without an account">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Open the <TextLink href="/">reqq.cc homepage</TextLink> and paste
            your long link into the box.
          </li>
          <li>If you like, type a custom name, like reqq.cc/my-event.</li>
          <li>
            Press the button. Copy your short link, or press “QR code” to
            download a code for it.
          </li>
        </ol>
      </Section>

      <Section title="With and without an account">
        <CompareTable
          head={['', 'No account', 'Free account']}
          rows={[
            ['Shorten links', 'Yes', 'Yes'],
            ['Custom names', 'Yes', 'Yes'],
            ['QR codes (PNG and SVG)', 'Yes', 'Yes'],
            ['Links expire', 'Never', 'Never'],
            ['See a list of your links', 'No', 'Yes'],
            ['Change where a link goes', 'No', 'Yes'],
            ['Delete a link', 'No', 'Yes'],
            ['Click stats', 'No', 'Yes'],
          ]}
        />
        <p>
          An account needs only an email address and a password. It’s the way
          to go for anything you print, like a QR code on a flyer, because you
          can fix the destination later without reprinting. The{' '}
          <TextLink href="/link-click-counter">link click counter</TextLink>{' '}
          page shows what the stats look like.
        </p>
      </Section>

      <Section title="Safe for the people who click">
        <p>
          Shortening without an account doesn’t mean anything goes. Every new
          link is checked with Google Safe Browsing and all links are checked
          again each week. A link Google flags shows a warning instead of
          sending people on. Links to other URL shorteners are refused, so a
          reqq.cc link can’t be used to hide a chain of redirects.
        </p>
      </Section>
    </LandingPage>
  );
}
