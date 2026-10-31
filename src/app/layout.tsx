import '../styles/globals.css';
import { Toaster } from 'sonner';
import Navbar from '../components/Navbar';
import { UserProvider } from './context/UserContext';
import localFont from 'next/font/local';
import { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Footer from '@/components/Footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'], // pick the weights you actually use
  variable: '--font-poppins', // CSS var name Tailwind will reference
  preload: false, // only used in the forgot-password modal
});
// Latin-only WOFF2 subsets of the original TTFs
const FredokaOne = localFont({
  src: '../../public/fonts/FredokaOne-Regular.woff2',
  variable: '--font-fredoka-one',
});

const BalooThambi = localFont({
  src: '../../public/fonts/BalooThambi-Regular.woff2',
  variable: '--font-baloo-thambi',
});

const TITLE = 'reqq.cc – Free URL Shortener';
const DESCRIPTION =
  'Free, fast and private URL shortener. Paste a long link and get a short reqq.cc link, with an optional custom name.';

// Optional: Add metadata for <head>
export const metadata: Metadata = {
  // Absolute base for the share image (app/opengraph-image.png) and other
  // metadata URLs, so they always point at reqq.cc, never a vercel.app host.
  metadataBase: new URL('https://reqq.cc'),
  title: TITLE,
  description: DESCRIPTION,
  // No og:url here: pages would inherit it. Each page sets its canonical URL.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'reqq.cc',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${FredokaOne.variable} ${BalooThambi.variable} ${poppins.variable} bg-background min-h-screen text-white antialiased`}
      >
        <UserProvider>
          <Navbar />
          <main className="flex w-full">{children}</main>
          <Footer />
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
