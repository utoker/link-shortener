// /app/page.tsx
// Home page component

import ConfettiEffect from '../components/ConfettiEffect';
import FeaturesSection from '../components/FeaturesSection';
import Hero from '../components/Hero';
import LinksList from '../components/LinksList';

export default async function Home() {
  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen flex-col items-center">
      <ConfettiEffect />
      <Hero />
      <LinksList />
      <FeaturesSection />
    </main>
  );
}
