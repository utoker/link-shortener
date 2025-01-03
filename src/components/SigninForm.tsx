import { signinWith, signinWithPasswordAction } from 'app/actions/authActions';
import { useUserContext } from 'app/context/UserContext';
import { signinSchema } from 'lib/validation/signinScheme';
import { startTransition, useActionState, useEffect, useState } from 'react';

interface SigninFormProps {
  onSuccess: () => void;
}

export function SigninForm({ onSuccess }: SigninFormProps) {
  const [state, signIn, pending] = useActionState(signinWithPasswordAction, {
    success: undefined,
    errors: undefined,
    generalError: undefined,
  });
  const { refetchUser } = useUserContext();

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      await signinWith(provider);
      onSuccess();
    } catch (error) {
      console.log('OAuth Sign-In Error:', error);
    }
  };

  useEffect(() => {
    if (state.success) {
      refetchUser();
      onSuccess();
    }
  }, [state.success, onSuccess, refetchUser]);

  return (
    <form action={signIn} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          className="mt-1 block w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your email"
          required
        />

        {state.errors?.email && (
          <p className="text-sm text-error">{state.errors.email[0]}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          className="mt-1 block w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your password"
          required
        />
        {state.errors?.password && (
          <p className="text-sm text-error">{state.errors.password[0]}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-primary px-4 py-2 text-white shadow hover:bg-primary/90 focus:outline-none focus:ring focus:ring-primary"
      >
        {pending ? 'Signing In...' : 'Sign In'}
      </button>
      {state.generalError && (
        <p className="mt-2 text-sm text-error">{state.generalError}</p>
      )}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          className="w-full rounded bg-red-500 px-4 py-2 text-white shadow hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-500"
        >
          Sign in with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuthSignIn('github')}
          className="w-full rounded bg-gray-800 px-4 py-2 text-white shadow hover:bg-gray-900 focus:outline-none focus:ring focus:ring-gray-700"
        >
          Sign in with GitHub
        </button>
      </div>
    </form>
  );
}
