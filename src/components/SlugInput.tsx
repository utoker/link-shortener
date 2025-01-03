'use client';

import { useState, useEffect } from 'react';
import { useUserContext } from '@app/context/UserContext';
import { CreateLinkFormSchema } from '@lib/validation/CreateLinkFormSchema';

export default function SlugInput({
  resetForm,
  onValidationChange,
}: {
  resetForm: boolean;
  onValidationChange: (isValid: boolean) => void; // New prop
}) {
  const { slugs } = useUserContext();
  const [slugInput, setSlugInput] = useState('');
  const [error, setError] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(false);

  useEffect(() => {
    if (resetForm) {
      setSlugInput('');
      setError('');
      setSlugAvailable(null);
    }
  }, [resetForm]);

  useEffect(() => {
    const validateSlug = () => {
      const trimmedSlug = slugInput.trim();

      // Check if slug input is empty
      if (!trimmedSlug) {
        setError('');
        setSlugAvailable(null); // Reset availability state
        onValidationChange(false);
        return;
      }

      const validation = CreateLinkFormSchema.shape.slug.safeParse(trimmedSlug);
      if (!validation.success) {
        setError(validation.error.errors.map((e) => e.message).join(' '));
        setSlugAvailable(false);
        onValidationChange(false);
        return;
      }

      const exists = slugs?.some((slug) => slug === trimmedSlug);
      setSlugAvailable(!exists);
      setError(exists ? 'This slug is already taken.' : '');
      onValidationChange(!exists);
    };

    validateSlug();
  }, [slugInput, slugs]);

  return (
    <div>
      <label
        htmlFor="slug"
        className="block text-sm font-medium text-foreground"
      >
        Slug
      </label>
      <input
        id="slug"
        name="slug"
        type="text"
        value={slugInput}
        onChange={(e) => setSlugInput(e.target.value)}
        className="w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Enter a unique slug"
        required
      />
      {error && <p className="text-sm text-error">{error}</p>}
      {slugAvailable && !error && (
        <p className="text-success text-sm">Slug is available!</p>
      )}
    </div>
  );
}
