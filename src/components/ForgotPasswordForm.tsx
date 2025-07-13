'use client';

import { useEffect, useRef, useActionState } from 'react';
import { toast } from 'sonner';

import { resetPasswordAction } from '@/app/actions/auth';
import type { ResetPwResult } from '@/app/actions/auth/resetPassword';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  /* React-19 native form handling */
  const initial: ResetPwResult = { success: false };
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initial,
  );

  /* Side-effects */
  useEffect(() => {
    if (state.success) {
      toast.success('Password-reset email sent!');
      formRef.current?.reset();
      onSuccess?.();
    }
    if (state.formError) toast.error(state.formError);
  }, [state, onSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mx-auto flex w-full max-w-sm flex-col gap-4"
    >
      <div className="font-baloo-thambi flex flex-col gap-1">
        <label htmlFor="email" className="ml-3 block text-2xl text-black">
          Email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="example@mail.com"
          disabled={pending}
          required
          className="focus:ring-blue focus:ring-offset-yellow rounded-full text-center text-2xl text-black placeholder:text-2xl placeholder:text-stone-500 focus:ring-2 focus:ring-offset-2"
          aria-invalid={!!state.fieldErrors?.email}
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-blue font-fredoka-one hover:bg-darkblue disabled:bg-blue/50 rounded-full text-3xl transition-colors disabled:cursor-not-allowed disabled:text-white"
      >
        {pending ? 'Sending…' : 'Reset Password'}
      </Button>
    </form>
  );
}
