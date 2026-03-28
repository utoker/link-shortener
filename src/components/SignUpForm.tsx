'use client';

import { useActionState, useEffect, startTransition } from 'react';
import { toast } from 'sonner';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { signUpWithPasswordAction } from '@/app/actions/auth';
import { createBrowserClientSupabase } from '@/lib/supabase/client';
import type { SignUpResult } from '@/app/actions/auth/signUpWithPassword';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Provider } from '@/lib/types/actions';
import { useUserContext } from '@/app/context/UserContext';

interface SignUpFormProps {
  onSuccess: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  /* ---------------------------------------------------------------------- */
  /* useActionState — native React 19 form handling                          */
  /* ---------------------------------------------------------------------- */
  const initial: SignUpResult = { success: false };
  const [state, formAction, pending] = useActionState(
    signUpWithPasswordAction,
    initial,
  );

  /* user context + confetti side-effects */
  const { refetchUser, triggerConfetti } = useUserContext();

  useEffect(() => {
    if (state.success) {
      toast.success('Account created successfully!');
      startTransition(refetchUser);
      triggerConfetti();
      onSuccess();
    }
    if (state.formError) toast.error(state.formError);
  }, [state, refetchUser, triggerConfetti, onSuccess]);

  /* OAuth helper */
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
        toast.error('Failed to initiate OAuth sign up');
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Mark-up — ALL original classes & sizes preserved                       */
  /* ---------------------------------------------------------------------- */
  return (
    <form
      action={formAction}
      className="font-baloo-thambi mx-auto max-w-3xl space-y-2"
    >
      {/* Name */}
      <div>
        <label htmlFor="name" className="ml-3 block font-medium">
          Full Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          className={`w-full rounded-full border-[3px] border-black px-4 py-2 ${
            state.fieldErrors?.name ? 'border-red-500' : ''
          }`}
          placeholder="Enter your full name"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 ml-3 text-sm text-red-600">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="ml-3 block font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          className={`w-full rounded-full border-[3px] border-black px-4 py-2 ${
            state.fieldErrors?.email ? 'border-red-500' : ''
          }`}
          placeholder="example@mail.com"
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 ml-3 text-sm text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="ml-3 block font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          className={`w-full rounded-full border-[3px] border-black px-4 py-2 ${
            state.fieldErrors?.password ? 'border-red-500' : ''
          }`}
          placeholder="Enter a password"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 ml-3 text-sm text-red-600">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="ml-3 block font-medium">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className={`w-full rounded-full border-[3px] border-black px-4 py-2 ${
            state.fieldErrors?.confirmPassword ? 'border-red-500' : ''
          }`}
          placeholder="Re-enter your password"
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 ml-3 text-sm text-red-600">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      {/* OAuth buttons (disabled placeholders) */}
      <Button
        type="button"
        onClick={() => handleOAuth('github')}
        className="font-fredoka-one mx-auto mt-4 rounded-full border-2 border-black bg-white text-xl leading-none text-black [box-shadow:0_6px_4px_rgba(0,0,0,0.25)] hover:cursor-pointer hover:bg-white/20 hover:text-white/80"
      >
        <FaGithub className="h-5 w-5 shrink-0" aria-hidden />
        Sign Up with GitHub
      </Button>

      <Button
        type="button"
        onClick={() => handleOAuth('google')}
        className="font-fredoka-one mx-auto mt-4 rounded-full border-2 border-black bg-white text-xl leading-none text-black [box-shadow:0_6px_4px_rgba(0,0,0,0.25)] hover:cursor-pointer hover:bg-white/20 hover:text-white/80"
      >
        <FcGoogle className="h-5 w-5 shrink-0" aria-hidden />
        Sign Up with Google
      </Button>

      {/* Submit */}
      <Button
        type="submit"
        disabled={pending}
        className="bg-yellow hover:bg-yellow/20 font-fredoka-one mx-auto mt-4 block rounded-full border-2 border-black text-xl leading-none text-black [box-shadow:0_6px_4px_rgba(0,0,0,0.25)] hover:cursor-pointer hover:text-white/80"
      >
        {pending ? 'Creating account…' : 'Sign Up'}
      </Button>
    </form>
  );
}
