'use client';

import { Button } from './ui/button';
import { useActionState, startTransition, useState, useEffect } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { updatePasswordAction } from '../app/actions/authActions';

// Define Zod schema
const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'], // Show error under confirm password
  });

export default function UpdatePasswordForm() {
  const [state, updatePassword, pending] = useActionState(
    updatePasswordAction,
    {
      success: undefined,
      errors: undefined,
      generalError: undefined,
    },
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate form data using Zod
    const validation = updatePasswordSchema.safeParse(data);

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

    // Clear errors and submit form
    setFormErrors({});
    startTransition(() => {
      updatePassword(formData);
    });
  };

  useEffect(() => {
    if (state.success) {
      console.log('Password updated successfully!');
      router.push('/'); // Redirect to homepage after successful update
    }
  }, [state.success, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter a new password"
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
          placeholder="Re-enter your new password"
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
        {pending ? 'Updating Password...' : 'Update Password'}
      </Button>

      {state.generalError && (
        <p className="mt-2 text-sm text-error">{state.generalError}</p>
      )}

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-sm text-primary underline hover:text-primary/90"
        >
          Back to Homepage
        </button>
      </div>
    </form>
  );
}
