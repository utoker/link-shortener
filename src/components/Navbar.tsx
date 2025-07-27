'use client';

import AuthModalManager from './AuthModalManager';
import { useUserContext } from '../app/context/UserContext';
import SignOutButton from './SignOutButton';
import LoadingSpinner from './LoadingSpinner';
import DonateButton from './DonateButton';
import Link from 'next/link';

const Navbar = () => {
  const { user, loading } = useUserContext();

  return (
    <nav className="mx-auto flex w-full items-start justify-between px-4 py-2">
      <Link
        href="/"
        aria-label="Go to homepage"
        className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <img
          src="/Images/logo.svg"
          alt="reqq.cc logo"
          className="h-20 w-20 cursor-pointer sm:h-40 sm:w-40"
        />
      </Link>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <DonateButton className="mx-auto px-2 py-1" />
        {/* Donate is always visible */}

        {loading ? (
          <LoadingSpinner />
        ) : user ? (
          <SignOutButton />
        ) : (
          <AuthModalManager />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
