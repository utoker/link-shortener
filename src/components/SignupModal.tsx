'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { SignupForm } from './SignupForm';

interface SignupModalProps {
  isOpen: boolean; // Control modal visibility
  onClose: () => void;
  onSigninRedirect: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSigninRedirect,
}: SignupModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>
            Enter your details below to create an account.
          </DialogDescription>
        </DialogHeader>
        <SignupForm onSuccess={onClose} />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSigninRedirect}
            className="text-sm text-primary underline hover:text-primary/90"
          >
            Already have an account? Sign in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
