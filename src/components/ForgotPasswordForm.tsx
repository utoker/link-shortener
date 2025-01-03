'use client';

import { startTransition, useActionState, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { resetPasswordAction } from '../app/actions/authActions';
import { forgotPasswordSchema } from '../lib/validation/forgotPasswordSchema';

export default function ForgotPasswordForm() {
  const [state, sendRecoveryEmail, isPending] = useActionState(
    resetPasswordAction,
    {
      success: undefined,
      errors: undefined,
      generalError: undefined,
    },
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasSentRecovery, setHasSentRecovery] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      email: formData.get('email') as string,
    };

    // Validate using Zod
    const validation = forgotPasswordSchema.safeParse(data);

    if (!validation.success) {
      const errors = validation.error.errors.reduce(
        (acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        },
        {} as Record<string, string>,
      );
      setFormErrors(errors);
      return;
    }

    // Clear errors
    setFormErrors({});

    // Dispatch the async action using startTransition
    startTransition(() => {
      sendRecoveryEmail(formData);
    });
  };

  // Lockout user after successful email
  useEffect(() => {
    if (state.success) {
      setHasSentRecovery(true);
    }
  }, [state.success]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          name="email"
          type="email"
          className="mt-1 block w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your email"
          required
          disabled={hasSentRecovery} // Disable input after success
        />
        {formErrors.email && (
          <p className="text-sm text-error">{formErrors.email}</p>
        )}
        {state.errors?.email && (
          <p className="text-sm text-error">{state.errors.email[0]}</p>
        )}
        {state.generalError && (
          <p className="text-sm text-error">{state.generalError}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isPending || hasSentRecovery} // Disable button after success
        className={`w-full rounded bg-button-primary px-4 py-2 text-white shadow hover:bg-button-primary/90 focus:outline-none focus:ring focus:ring-primary ${
          hasSentRecovery ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        {isPending
          ? 'Sending...'
          : hasSentRecovery
            ? 'Email Sent'
            : 'Send Recovery Email'}
      </Button>
      {state.success && (
        <p className="text-success mt-2 text-sm">
          Password recovery email sent. Please check your inbox.
        </p>
      )}
    </form>
  );
}
