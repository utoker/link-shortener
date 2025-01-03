'use client';

import { CreateLinkFormSchema } from 'lib/validation/CreateLinkFormSchema';
import { useState, useEffect } from 'react';

export default function UrlInput({
  resetForm,
  onValidationChange,
}: {
  resetForm: boolean;
  onValidationChange: (isValid: boolean) => void;
}) {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (resetForm) {
      setUrlInput('');
      setError('');
    }
  }, [resetForm]);

  useEffect(() => {
    const validateUrl = () => {
      if (!urlInput.trim()) return;

      // Validate the raw URL
      const validation = CreateLinkFormSchema.shape.url.safeParse(
        urlInput.trim(),
      );
      if (!validation.success) {
        setError(validation.error.errors.map((e) => e.message).join(' '));
        onValidationChange(false);
      } else {
        setError('');
        onValidationChange(true);
      }
    };

    validateUrl();
  }, [urlInput, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  return (
    <div>
      <label
        htmlFor="url"
        className="block text-sm font-medium text-foreground"
      >
        URL
      </label>
      <input
        id="url"
        name="url"
        type="text"
        value={urlInput}
        onChange={handleInputChange}
        className="w-full rounded border border-border bg-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Enter a valid URL starting with http:// or https://"
        required
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
