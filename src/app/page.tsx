// /app/page.tsx
// Home page component

import ConfettiEffect from '../components/ConfettiEffect';
import CreateShortlinkForm from '../components/CreateShortlinkForm';
import Header from '../components/Header';
import ShortlinksList from '../components/ShortlinksList';

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto flex-grow px-4 py-6">
        <ConfettiEffect />
        <CreateShortlinkForm />
        <ShortlinksList />
      </main>
    </div>
  );
}
