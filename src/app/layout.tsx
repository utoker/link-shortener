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
  weight: ['400', '600', '700', '800'], // pick the weights you actually use
  variable: '--font-poppins', // CSS var name Tailwind will reference
});
const FredokaOne = localFont({
  src: '../../public/fonts/FredokaOne-Regular.ttf',
  variable: '--font-fredoka-one',
});

const BalooThambi = localFont({
  src: '../../public/fonts/BalooThambi-Regular.ttf',
  variable: '--font-baloo-thambi',
});

// Optional: Add metadata for <head>
export const metadata: Metadata = {
  title: 'Reqq.cc',
  description: 'Shorten your links with ease.',
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
