'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { updatePasswordAction } from '@/app/actions/auth';
import type { UpdatePwResult } from '@/app/actions/auth/updatePassword';
import { type UpdatePasswordFormValues } from '@/lib/schemas/updatePasswordSchema';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export default function UpdatePasswordForm() {
  const router = useRouter();

  /* ------------------------------------------------------------- *
   * useActionState  –  native React 19 form handling
   * ------------------------------------------------------------- */
  const initial: UpdatePwResult = { success: false };
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initial,
  );

  /* side-effects */
  useEffect(() => {
    if (state.success) {
      toast.success('Password updated successfully!');
      router.push('/');
    }
    if (state.formError) {
      toast.error(state.formError);
    }
  }, [state, router]);

  /* helper to show a field error */
  const err = (key: keyof UpdatePasswordFormValues) =>
    state.fieldErrors?.[key]?.[0];

  /* ------------------------------------------------------------- *
   * Mark-up  –  ALL original classes retained
   * ------------------------------------------------------------- */
  return (
    <div className="mx-auto pt-8 sm:pt-16">
      <Card className="bg-yellow font-baloo-thambi max-w-xs rounded-[72px] shadow-xl sm:max-w-md">
        <CardContent>
          <form action={formAction} className="space-y-6 py-6 sm:py-12">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="ml-6 block text-xl text-black sm:text-3xl"
              >
                New Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your new password"
                disabled={pending}
                className="h-14 w-full rounded-3xl border-2 border-black bg-gray-200 px-6 py-3 text-black placeholder:text-2xl"
                aria-invalid={!!err('password')}
              />
              {err('password') && (
                <p className="mt-1 ml-6 text-sm text-red-600">
                  {err('password')}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="ml-6 block text-xl text-black sm:text-3xl"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                disabled={pending}
                className="h-14 w-full rounded-3xl border-2 border-black bg-gray-200 px-6 py-3 text-black placeholder:text-2xl"
                aria-invalid={!!err('confirmPassword')}
              />
              {err('confirmPassword') && (
                <p className="mt-1 ml-6 text-sm text-red-600">
                  {err('confirmPassword')}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="bg-blue hover:hover:bg-darkblue mx-auto flex justify-center rounded-full border-2 border-black px-4 py-6 text-2xl text-white sm:w-80 sm:text-4xl"
            >
              {pending ? 'Updating…' : 'Update Password'}
            </Button>
          </form>

          <div className="mt-4 text-center text-2xl">
            <Link
              href="/"
              className="hover:hover:bg-darkblue text-black underline decoration-black"
            >
              Back to Homepage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
