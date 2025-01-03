'use client';

import { useState, useRef } from 'react';
import SignupModal from './SignupModal';
import SigninModal from './SigninModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function AuthModalManager() {
  const [currentModal, setCurrentModal] = useState<
    'signup' | 'signin' | 'forgotPassword' | null
  >(null);

  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const handleModalOpen = (
    modalType: 'signup' | 'signin' | 'forgotPassword',
  ) => {
    lastFocusedElement.current = document.activeElement as HTMLElement;
    setCurrentModal(modalType);
  };

  const handleModalClose = () => {
    setCurrentModal(null);
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
    }
  };

  return (
    <>
      <button
        onClick={() => handleModalOpen('signup')}
        className="rounded bg-primary px-4 py-2 text-white"
      >
        Sign Up
      </button>

      <button
        onClick={() => handleModalOpen('signin')}
        className="ml-4 rounded bg-secondary px-4 py-2 text-white"
      >
        Sign In
      </button>

      {currentModal === 'signup' && (
        <SignupModal
          isOpen={currentModal === 'signup'}
          onClose={handleModalClose}
          onSigninRedirect={() => setCurrentModal('signin')}
        />
      )}

      {currentModal === 'signin' && (
        <SigninModal
          isOpen={currentModal === 'signin'}
          onClose={handleModalClose}
          onSignupRedirect={() => setCurrentModal('signup')}
          onForgotPassword={() => setCurrentModal('forgotPassword')}
        />
      )}

      {currentModal === 'forgotPassword' && (
        <ForgotPasswordModal
          isOpen={currentModal === 'forgotPassword'}
          onClose={handleModalClose}
          onSigninRedirect={() => setCurrentModal('signin')}
        />
      )}
    </>
  );
}
