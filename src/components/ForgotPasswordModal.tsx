'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import ForgotPasswordForm from './ForgotPasswordForm';

interface ForgotPasswordModalProps {
  isOpen: boolean; // Control modal visibility
  onClose: () => void;
  onSigninRedirect: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSigninRedirect,
}: ForgotPasswordModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email to receive a password recovery link.
          </DialogDescription>
        </DialogHeader>
        <ForgotPasswordForm />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSigninRedirect}
            className="text-sm text-primary underline hover:text-primary/90"
          >
            Back to Sign In
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
