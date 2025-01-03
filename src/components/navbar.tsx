'use client';

import { useUserContext } from 'app/context/UserContext';
import SignoutButton from './SignoutButton';
import AuthModalManager from './AuthModalManager';

const Navbar = () => {
  const { user, loading } = useUserContext();

  return (
    <div className="container mx-auto flex items-center justify-between bg-background p-4 text-foreground">
      <div className="text-xl font-bold">Reqq.cc</div>
      <div className="flex items-center space-x-4">
        {loading ? (
          <div className="flex h-10 items-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : user ? (
          <>
            <span className="text-sm font-medium text-foreground">
              Hi {user.user_metadata?.name || 'there'}!
            </span>
            <SignoutButton />
          </>
        ) : (
          <AuthModalManager />
        )}
      </div>
    </div>
  );
};

export default Navbar;
