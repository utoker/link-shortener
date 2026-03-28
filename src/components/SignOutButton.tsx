'use client';

import { useActionState, useEffect, startTransition } from 'react';

import { signOutAction } from '@/app/actions/auth';
import type { SignOutResult } from '@/app/actions/auth/signOut';
import { useUserContext } from '@/app/context/UserContext';
import { Button } from './ui/button';
import SignOutIcon from '@/icons/signout-icon.svg';

interface SignOutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function SignOutButton({ ...props }: SignOutButtonProps) {
  const initial: SignOutResult = { success: false };
  const [state, runSignOut, pending] = useActionState(signOutAction, initial);

  /* Refresh user context after successful sign-out */
  const { refetchUser } = useUserContext();

  useEffect(() => {
    if (state.success) {
      refetchUser();
    }
    if (state.formError) {
      console.error('Error during logout:', state.formError);
    }
  }, [state, refetchUser]);

  /* Trigger sign-out in a transition */
  const handleClick = () => {
    startTransition(() => {
      const fd = new FormData(); // empty — signOutAction ignores it
      runSignOut(fd);
    });
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={pending}
      className="h-10 w-32 cursor-pointer rounded-full border border-black bg-white hover:bg-white/80 sm:h-14 sm:w-48 sm:border-2"
    >
      <SignOutIcon className="h-6 w-6 shrink-0 sm:h-8 sm:w-8" />
      <div className="font-fredoka-one text-[14px] text-black sm:text-2xl">
        <span>Sign Out</span>
      </div>
    </Button>
  );
}
