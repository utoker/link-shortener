'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { SigninForm } from './SigninForm';

interface SigninModalProps {
  isOpen: boolean; // Control modal visibility
  onClose: () => void;
  onSignupRedirect: () => void;
  onForgotPassword: () => void;
}

export default function SigninModal({
  isOpen,
  onClose,
  onSignupRedirect,
  onForgotPassword,
}: SigninModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Enter your email and password to sign in to your account.
          </DialogDescription>
        </DialogHeader>
        <SigninForm onSuccess={onClose} />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSignupRedirect}
            className="text-sm text-primary underline hover:text-primary/90"
          >
            Don’t have an account? Sign up
          </button>
          <button
            type="button"
            onClick={onForgotPassword}
            className="ml-4 text-sm text-primary underline hover:text-primary/90"
          >
            Forgot Password?
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
