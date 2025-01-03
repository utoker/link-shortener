import { signOutAction } from 'app/actions/authActions';
import { useUserContext } from 'app/context/UserContext';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, startTransition } from 'react';

const SignoutButton = () => {
  const router = useRouter();
  const { refetchUser } = useUserContext();

  const [state, signOut, pending] = useActionState(signOutAction, {
    success: undefined,
    error: undefined,
  });

  useEffect(() => {
    if (state.success) {
      // Clear the user context
      refetchUser();
    }

    if (state.error) {
      console.log('Error during logout:', state.error);
    }
  }, [state.success, state.error, refetchUser, router]);

  const handleSignOut = () => {
    startTransition(() => {
      signOut();
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={pending}
      className={`rounded-md bg-primary px-4 py-2 text-foreground transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        pending ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {pending ? 'Logging Out...' : 'Logout'}
    </button>
  );
};

export default SignoutButton;
