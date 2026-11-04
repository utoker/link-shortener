'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteLinkDialogProps {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the user confirms; the dialog closes itself */
  onConfirm: () => void;
}

const buttonClass =
  'font-baloo-thambi flex-1 rounded-full py-3 text-xl transition-colors';

/**
 * Asks before a link is deleted, since that can't be undone: printed QR codes
 * stop working and the click stats go too. "Cancel" comes first, so it has
 * the focus when the dialog opens.
 */
export default function DeleteLinkDialog({
  slug,
  open,
  onOpenChange,
  onConfirm,
}: DeleteLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-yellow w-[90vw] max-w-md rounded-[26px] px-8 pt-8 pb-10 shadow-xl">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-fredoka-one text-3xl text-black">
            Delete link?
          </DialogTitle>
          <DialogDescription className="font-poppins text-black">
            reqq.cc/{slug} and its QR codes will stop working, and its click
            stats will be deleted. This can’t be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => onOpenChange(false)}
            className={`${buttonClass} bg-blue hover:bg-darkblue`}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className={buttonClass}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
