'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { updateLink } from '@/app/actions/data/updateLink';
import type { UpdateLinkResult } from '@/app/actions/data/updateLink';
import { CreateLinkFormSchema } from '@/lib/schemas/CreateLinkFormSchema';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { ensureProtocol } from '@/lib/utils';
import { describeThreats } from '@/lib/threatNames';

interface EditLinkDialogProps {
  /** safety_threats: set when the weekly link check blocked the link */
  link: {
    id: string;
    slug: string;
    url: string;
    safety_threats?: string[] | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful save, e.g. to reload the link list */
  onSaved: () => void;
}

/** Mount with a fresh `key` per opening so it starts from the saved URL. */
export default function EditLinkDialog({
  link,
  open,
  onOpenChange,
  onSaved,
}: EditLinkDialogProps) {
  const [url, setUrl] = useState(link.url);
  const [urlError, setUrlError] = useState('');
  const debouncedUrl = useDebounce(url, 300);

  // Same live check as the homepage
  useEffect(() => {
    const trimmed = debouncedUrl.trim();
    if (!trimmed) {
      setUrlError('');
      return;
    }
    const parsed = CreateLinkFormSchema.shape.url.safeParse(
      ensureProtocol(trimmed),
    );
    setUrlError(parsed.success ? '' : parsed.error.issues[0].message);
  }, [debouncedUrl]);

  const [state, formAction, pending] = useActionState(
    async (prev: UpdateLinkResult, fd: FormData) => {
      const res = await updateLink(prev, fd);
      if (res.success) {
        toast.success('Link updated');
        onSaved();
        onOpenChange(false);
      } else if (res.formError) {
        toast.error(res.formError);
      }
      return res;
    },
    { success: false },
  );

  // live check while typing, else the server's verdict (e.g. Safe Browsing)
  const shownError = urlError || state.fieldErrors?.url?.[0];
  const unchanged = url.trim() === link.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-yellow w-[90vw] max-w-lg rounded-[26px] px-8 pt-8 pb-10 shadow-xl">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-fredoka-one text-3xl text-black">
            Edit link
          </DialogTitle>
          <DialogDescription className="font-poppins text-black">
            Change where reqq.cc/{link.slug} leads. The short link stays the
            same.
          </DialogDescription>
        </DialogHeader>

        {link.safety_threats && (
          <p className="font-poppins text-sm text-red-800">
            Google Safe Browsing reports this destination as{' '}
            {describeThreats(link.safety_threats)}, so visitors see a warning
            page instead. Save a different destination to lift the block.
          </p>
        )}

        <form action={formAction} className="space-y-2">
          <input type="hidden" name="linkId" value={link.id} />
          <label htmlFor="edit-url" className="sr-only">
            Destination
          </label>
          <input
            id="edit-url"
            name="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={pending}
            aria-invalid={!!shownError}
            aria-describedby="edit-url-error"
            className="font-baloo-thambi border-darkblue bg-input w-full rounded-2xl border-4 px-4 py-2 text-lg text-black focus:outline-none"
          />
          <p
            id="edit-url-error"
            aria-live="polite"
            className="font-poppins min-h-6 text-sm text-red-800"
          >
            {shownError}
          </p>
          <Button
            type="submit"
            disabled={pending || unchanged || !url.trim() || !!urlError}
            className="font-baloo-thambi bg-blue hover:bg-darkblue w-full rounded-full py-3 text-xl transition-colors"
          >
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
