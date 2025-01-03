'use client';

import { signupWithPasswordAction } from '../app/actions/authActions';
import { useUserContext } from '../app/context/UserContext';
import { signupSchema } from '../lib/validation/signupScheme';
import { Button } from './ui/button';
import { startTransition, useActionState, useEffect, useState } from 'react';

interface SignupFormProps {
  onSuccess: () => void; // Callback for successful sign-up
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [state, signup, pending] = useActionState(signupWithPasswordAction, {
    success: undefined,
    errors: undefined,
    generalError: undefined,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { refetchUser, triggerConfetti } = useUserContext();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const validation = signupSchema.safeParse(data);

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

    setFormErrors({});
    startTransition(() => {
      signup(formData);
    });
  };

  useEffect(() => {
    if (state.success) {
      refetchUser();
      onSuccess();
      triggerConfetti();
    }
  }, [state.success, onSuccess, refetchUser]);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your Name"
            required
          />
          {formErrors.name && (
            <p className="text-sm text-error">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            className="w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="example@mail.com"
            required
          />
          {formErrors.email && (
            <p className="text-sm text-error">{formErrors.email}</p>
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
            id="signup-password"
            name="password"
            type="password"
            className="w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter a password"
            required
          />
          {formErrors.password && (
            <p className="text-sm text-error">{formErrors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-foreground"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            className="w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Re-enter your password"
            required
          />
          {formErrors.confirmPassword && (
            <p className="text-sm text-error">{formErrors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={pending}
          className={`w-full rounded bg-primary px-4 py-2 text-white shadow focus:outline-none focus:ring focus:ring-primary ${
            pending ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {pending ? 'Creating Account...' : 'Sign Up'}
        </Button>
        {state.generalError && (
          <p className="mt-2 text-sm text-error">{state.generalError}</p>
        )}
      </form>
    </>
  );
}
