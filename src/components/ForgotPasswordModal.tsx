'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ForgotPasswordForm from './ForgotPasswordForm';

// -----------------------------------------------------------------------------
// Modal props
// -----------------------------------------------------------------------------
interface ForgotPasswordModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Navigate back to sign‑in (e.g. open sign‑in modal or route) */
  onSigninRedirect: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSigninRedirect,
}: ForgotPasswordModalProps) {
  const [sent, setSent] = useState(false);

  // Reset to form view whenever the modal is closed from the outside
  useEffect(() => {
    if (!isOpen) setSent(false);
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (open ? undefined : onClose())}
    >
      <DialogContent className="bg-yellow w-[90vw] max-w-2xl rounded-[26px] px-10 pt-8 pb-12 shadow-xl">
        {sent ? (
          <div className="space-y-10 text-center">
            <DialogHeader>
              <DialogTitle className="font-fredoka-one text-3xl text-black md:text-4xl">
                Check your inbox
              </DialogTitle>
              <DialogDescription className="font-poppins text-lg text-black md:text-xl">
                We just sent you a link to reset your password.
                <br />
                If it doesn&apos;t appear, wait a minute and check spam.
              </DialogDescription>
            </DialogHeader>

            <Button
              onClick={() => {
                setSent(false);
                onClose();
                onSigninRedirect();
              }}
              className="font-baloo-thambi bg-blue hover:bg-darkblue w-full rounded-full py-3 text-3xl transition-colors"
            >
              Back to Sign-in
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="mb-2 text-black">
              <DialogTitle className="font-fredoka-one text-center text-3xl md:text-4xl">
                Password Recovery
              </DialogTitle>
              <DialogDescription className="font-poppins pt-2 text-lg md:text-xl">
                Enter your email to receive a password recovery link.
              </DialogDescription>
            </DialogHeader>

            <ForgotPasswordForm
              onSuccess={() => {
                toast.success('Password-reset email sent!');
                setSent(true);
              }}
            />

            <span
              className="font-poppins hover:text-darkblue text-center text-2xl font-bold text-black underline hover:cursor-pointer"
              onClick={onSigninRedirect}
            >
              Back to Sign-in
            </span>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
