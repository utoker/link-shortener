'use client';

import { useActionState, useCallback, useEffect, useState } from 'react';
import UrlInput from './UrlInput';
import CustomLinkInput from './CustomLinkInput';
import CenterIcon from '@icons/center-icon.svg';
import { useUserContext } from '@/app/context/UserContext';
import { CreateLinkFormSchema } from '@/lib/schemas/CreateLinkFormSchema';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { createLink } from '@/app/actions/data/createLink';
import { checkSlug } from '@/app/actions/data';
import type { CreateLinkResult } from '@/app/actions/data/createLink';
import { toast } from 'sonner';

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function Hero() {
  /* ──────────────────────────── local state ─────────────────────────── */
  const [slugInput, setSlugInput] = useState('');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  const debouncedSlug = useDebounce(slugInput, 300);
  const debouncedUrl = useDebounce(urlInput, 300);
  const { refetchLinks } = useUserContext();

  /* ────────────────── server action with automatic refetch ──────────── */
  const createLinkWithRefresh = useCallback(
    async (
      _prev: CreateLinkResult,
      fd: FormData,
    ): Promise<CreateLinkResult> => {
      const res = await createLink({ success: false }, fd);

      if (res.success) {
        /* ─ success flow ─────────────────────────────── */
        await refetchLinks();
        setSlugInput('');
        setSlugStatus('idle');
        setUrlInput('');
        setUrlError('');
        toast.success('Link created 🎉'); // ← show only on success
      } else {
        /* ─ failure flow ─────────────────────────────── */
        if (res.fieldErrors?.slug) {
          setSlugStatus('taken');
          toast.error(res.fieldErrors.slug[0]); // slug-specific error
        }

        if (res.fieldErrors?.url) {
          toast.error(res.fieldErrors.url[0]); // url-specific error
        }

        // generic fallback (e.g. DB issue without fieldErrors)
        if (!res.fieldErrors) {
          toast.error('Something went wrong');
        }
      }

      return res;
    },
    [refetchLinks],
  );

  const [state, formAction, pending] = useActionState<
    CreateLinkResult,
    FormData
  >(createLinkWithRefresh, { success: false });

  /* ─────────────────────── slug validation ──────────────────────────── */
  useEffect(() => {
    const trimmed = debouncedSlug.trim();
    if (!trimmed) {
      setSlugStatus('idle');
      return;
    }

    const parsed = CreateLinkFormSchema.shape.slug.safeParse(trimmed);
    if (!parsed.success) {
      setSlugStatus('invalid');
      return;
    }

    let active = true;
    (async () => {
      setSlugStatus('checking');
      const ok = await checkSlug(trimmed); // ↔ Supabase
      if (active) setSlugStatus(ok ? 'available' : 'taken');
    })();

    return () => {
      active = false;
    }; // abort on fast re-type
  }, [debouncedSlug]);

  /* ─────────────────────── url validation ───────────────────────────── */
  useEffect(() => {
    const trimmed = debouncedUrl.trim();
    if (!trimmed) {
      setUrlError('');
      return;
    }

    const parsed = CreateLinkFormSchema.shape.url.safeParse(trimmed);
    setUrlError(parsed.success ? '' : parsed.error.errors[0].message);
  }, [debouncedUrl]);

  /* ───────────────────────────── UI ─────────────────────────────────── */
  const helper = (() => {
    switch (slugStatus) {
      case 'available':
        return 'Slug is available!';
      case 'taken':
        return 'This slug is already taken.';
      case 'invalid':
        return 'Only a-z, 0-9 and “-” (1-64 chars).';
      default:
        return '';
    }
  })();

  return (
    <div className="flex items-center justify-center ">
      <form action={formAction}>
        <div className="border-blue relative flex h-48 w-xs flex-col items-center border-10 sm:h-96 sm:w-2xl sm:border-22">
          <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-12 sm:-translate-y-1">
            <div className="bg-darkblue absolute top-0 left-1/2 -z-50 h-16 w-11 -translate-x-1/2 -translate-y-1 sm:h-0" />
            <CenterIcon className="h-20 w-20 shrink-0 sm:h-32 sm:w-32" />
          </div>

          <UrlInput
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            urlError={urlError}
            disabled={pending}
          />

          <CustomLinkInput
            slugInput={slugInput}
            setSlugInput={setSlugInput}
            disabled={pending}
          />

          {/* helper text */}
          <div className="font-fredoka-one pt-8 text-lg text-white sm:pt-0 sm:text-2xl">
            <p
              aria-live="polite"
              className="font-baloo-thambi text-yellow h-6 pt-2 text-lg"
            >
              {helper}
            </p>

            {state.fieldErrors?.url && (
              <p className="text-red-500">{state.fieldErrors.url[0]}</p>
            )}

            {state.success && state.slug && (
              <p>
                Your link is ready:&nbsp;
                <a
                  href={`/${state.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue text-yellow underline transition-colors"
                >
                  reqq.cc/{state.slug}
                </a>
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
