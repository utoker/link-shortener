'use client';

import { PopoverArrow } from '@radix-ui/react-popover';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useState } from 'react';
import SignInButton from './SignInButton';
import SignInForm from './SignInForm';

interface SignInModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSignupRedirect: () => void;
}

export default function SignInModal({
  isOpen,
  onOpen,
  onClose,
  onSignupRedirect,
}: SignInModalProps) {
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  return (
    <>
      <Popover
        modal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose(); // Close the popover when it is dismissed
        }}
      >
        <PopoverTrigger asChild>
          <SignInButton onClick={onOpen} />
        </PopoverTrigger>
        <PopoverContent className="mx-auto">
          <SignInForm onSuccess={onClose} />
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSignupRedirect}
              className="font-baloo-thambi hover:text-yellow/80 m-0 block w-full cursor-pointer p-1 text-sm text-black underline"
            >
              Don&apos;t have an account? Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotPasswordOpen(true);
                onClose();
              }}
              className="font-baloo-thambi hover:text-yellow/80 m-0 block w-full cursor-pointer p-1 text-sm text-black underline"
            >
              Forgot Password?
            </button>
          </div>
          <PopoverArrow />
        </PopoverContent>
      </Popover>
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onSigninRedirect={() => {
          setForgotPasswordOpen(false);
          onOpen(); // Open sign-in modal again
        }}
      />
    </>
  );
}
