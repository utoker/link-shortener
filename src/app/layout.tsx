// /app/layout.tsx
// Layout component for the entire app
'use client';

import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { UserProvider } from './context/UserContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <UserProvider>
          <Navbar />
          <main className="container mx-auto">{children}</main>
          <footer className="bg-primary p-4 text-foreground">
            <p>© {new Date().getFullYear()} reqq.cc</p>
          </footer>
        </UserProvider>
      </body>
    </html>
  );
}
