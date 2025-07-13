'use client';

import AuthModalManager from './AuthModalManager';
import { useUserContext } from '../app/context/UserContext';
import SignOutButton from './SignOutButton';
import LoadingSpinner from './LoadingSpinner';

const Navbar = () => {
  const { user, loading } = useUserContext();

  return (
    <nav className="mx-auto flex w-full items-start justify-between px-4 py-2">
      <img
        src="/Images/logo.svg"
        alt="logo"
        className="h-20 w-20 sm:h-40 sm:w-40"
      />

      <div className="flex items-center space-x-4">
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
