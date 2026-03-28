'use client';

import { PopoverArrow } from '@radix-ui/react-popover';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import SignUpButton from './SignUpButton';
import SignUpForm from './SignUpForm';

interface SignUpModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSignInRedirect: () => void;
}

export default function SignUpModal({
  isOpen,
  onOpen,
  onClose,
  onSignInRedirect,
}: SignUpModalProps) {
  return (
    <Popover
      modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose(); // Close the popover when it is dismissed
      }}
    >
      <PopoverTrigger asChild>
        <SignUpButton onClick={onOpen} />
      </PopoverTrigger>
      <PopoverContent>
        <SignUpForm onSuccess={onClose} />
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onSignInRedirect}
            className="font-baloo-thambi hover:text-yellow/90 cursor-pointer text-sm text-black underline"
          >
            Already have an account? Sign in
          </button>
        </div>
        <PopoverArrow />
      </PopoverContent>
    </Popover>
  );
}
