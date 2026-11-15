// /app/page.tsx
// Home page component

import AuthNotice from '../components/AuthNotice';
import ConfettiEffect from '../components/ConfettiEffect';
import FeaturesSection from '../components/FeaturesSection';
import Hero from '../components/Hero';
import HomeInfo from '../components/HomeInfo';
import LinksList from '../components/LinksList';
import SignedOutOnly from '../components/SignedOutOnly';

// Static page served from the CDN; regenerate daily so the footer year stays current.
export const revalidate = 86400;

export const metadata = { alternates: { canonical: '/' } };

// Tells search engines what the site is: a free web app and who runs it.
// https://developers.google.com/search/docs/appearance/structured-data
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://reqq.cc/#website',
      name: 'reqq.cc',
      url: 'https://reqq.cc/',
      publisher: { '@id': 'https://reqq.cc/#organization' },
    },
    {
      '@type': 'Organization',
      '@id': 'https://reqq.cc/#organization',
      name: 'reqq.cc',
      url: 'https://reqq.cc/',
      logo: 'https://reqq.cc/apple-icon.png',
      email: 'support@reqq.cc',
      sameAs: ['https://github.com/utoker/link-shortener'],
    },
    {
      '@type': 'WebApplication',
      name: 'reqq.cc URL shortener',
      url: 'https://reqq.cc/',
      description:
        'Free URL shortener with custom links, QR codes and click stats. No ads and no sign-up needed to shorten a link.',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Short links with optional custom names',
        'QR codes as PNG or SVG',
        'Click stats by day, site, country and device',
        'Google Safe Browsing checks for every link',
      ],
      publisher: { '@id': 'https://reqq.cc/#organization' },
    },
  ],
};

export default function Home() {
  return (
    <div className="bg-background text-foreground mx-auto flex min-h-screen flex-col items-center">
      <script
        type="application/ld+json"
        // "<" escaped so the JSON can never close the script tag early
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <AuthNotice />
      <ConfettiEffect />
      <Hero />
      <LinksList />
      <SignedOutOnly>
        <FeaturesSection />
        <HomeInfo />
      </SignedOutOnly>
    </div>
  );
}
