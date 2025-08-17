'use client';

import { useActionState, useEffect, startTransition } from 'react';
import { toast } from 'sonner';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { signInWithPasswordAction } from '@/app/actions/auth';
import { createBrowserClientSupabase } from '@/lib/supabase/client';
import type { SignInResult } from '@/app/actions/auth/signInWithPassword';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Provider } from '@/lib/types/actions';
import { useUserContext } from '@/app/context/UserContext';

interface SignInFormProps {
  onSuccess: () => void;
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const initial: SignInResult = { success: false };
  const [state, formAction, pending] = useActionState(
    signInWithPasswordAction,
    initial,
  );

  /* ---------------- side-effects moved out of render ----------------- */
  const { refetchUser } = useUserContext();

  useEffect(() => {
    if (state.success) {
      toast.success('Signed in!');
      startTransition(refetchUser); // refresh context
      onSuccess(); // close modal / navigate
    }
    if (state.formError) {
      toast.error(state.formError);
    }
  }, [state, refetchUser, onSuccess]);

  /* ------------- unchanged UI (all original classes & sizes) ---------- */
  function handleOAuth(provider: Provider) {
    startTransition(async () => {
      try {
        const supabase = createBrowserClientSupabase();
        const origin = window.location.origin;
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${origin}/auth/callback` },
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        // The redirect will happen automatically via data.url
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (err) {
        console.error('OAuth error:', err);
        toast.error('Failed to initiate OAuth sign in');
      }
    });
  }

  return (
    <form
      action={formAction}
      className="font-baloo-thambi mx-auto max-w-3xl space-y-4"
    >
      {/* Email field */}
      <div>
        <label htmlFor="email" className="ml-3 block font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="example@mail.com"
          className={`w-full rounded-full border-2 px-4 py-2 ${
            state.fieldErrors?.email ? 'border-red-500' : ''
          }`}
          aria-invalid={!!state.fieldErrors?.email}
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 ml-3 text-sm text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password field */}
      <div>
        <label htmlFor="password" className="ml-3 block font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          className={`w-full rounded-full border-2 px-4 py-2 ${
            state.fieldErrors?.password ? 'border-red-500' : ''
          }`}
          aria-invalid={!!state.fieldErrors?.password}
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 ml-3 text-sm text-red-600">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* OAuth buttons (disabled placeholder) */}
      <Button
        type="button"
        onClick={() => handleOAuth('github')}
        className="font-fredoka-one mx-auto mt-4 flex items-center gap-2 rounded-full border-2 border-black bg-white px-6 py-2 text-xl text-black [box-shadow:0_6px_4px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:text-white/80"
      >
        <FaGithub className="h-5 w-5" /> Sign in with GitHub
      </Button>

      <Button
        type="button"
        onClick={() => handleOAuth('google')}
        className="font-fredoka-one mx-auto mt-2 flex items-center gap-2 rounded-full border-2 border-black bg-white px-6 py-2 text-xl text-black [box-shadow:0_6px_4px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:text-white/80"
      >
        <FcGoogle className="h-5 w-5" /> Sign in with Google
      </Button>

      {/* Submit */}
      <Button
        type="submit"
        disabled={pending}
        className="bg-yellow hover:bg-yellow/20 font-fredoka-one mx-auto mt-4 block w-full max-w-xs rounded-full border-2 border-black px-6 py-2 text-xl leading-none text-black [box-shadow:0_6px_4px_rgba(0,0,0,0.25)] hover:text-white/80"
      >
        {pending ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
