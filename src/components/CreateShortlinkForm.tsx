'use client';

import { startTransition, useActionState, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { createShortlinkAction } from '@app/actions/dataActions';
import SlugInput from './SlugInput';
import UrlInput from './UrlInput';
import { useUserContext } from '@app/context/UserContext';

export default function CreateShortlinkForm() {
  const { refetchShortlinks } = useUserContext();
  const [resetForm, setResetForm] = useState(false);
  const [isSlugValid, setIsSlugValid] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [state, action, isPending] = useActionState(createShortlinkAction, {
    success: false,
    shortlink: undefined,
    error: undefined,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!isSlugValid || !isUrlValid) {
      return;
    }

    startTransition(() => {
      action(formData);
    });
  };

  useEffect(() => {
    if (state.success) {
      refetchShortlinks();
      setResetForm(true);
    }
  }, [state.success]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UrlInput resetForm={resetForm} onValidationChange={setIsUrlValid} />
      <SlugInput resetForm={resetForm} onValidationChange={setIsSlugValid} />

      {/* Display errors or success messages */}
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      {state.success && state.shortlink && (
        <p className="text-success text-sm">
          Shortlink created successfully! Slug: {state.shortlink.slug} - URL:{' '}
          {state.shortlink.url}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className={`w-full rounded bg-primary px-4 py-2 text-white shadow focus:outline-none focus:ring focus:ring-primary ${
          isPending ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        {isPending ? 'Creating...' : 'Create Shortlink'}
      </Button>
    </form>
  );
}
