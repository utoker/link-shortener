// /app/page.tsx
// Home page component

import ConfettiEffect from '../components/ConfettiEffect';
import FeaturesSection from '../components/FeaturesSection';
import Hero from '../components/Hero';
import LinksList from '../components/LinksList';
import SignedOutOnly from '../components/SignedOutOnly';

// Static page served from the CDN; regenerate daily so the footer year stays current.
export const revalidate = 86400;

export const metadata = { alternates: { canonical: '/' } };

export default function Home() {
  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen flex-col items-center">
      <ConfettiEffect />
      <Hero />
      <LinksList />
      <SignedOutOnly>
        <FeaturesSection />
      </SignedOutOnly>
    </main>
  );
}
