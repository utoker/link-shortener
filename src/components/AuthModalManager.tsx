'use client';

import { useState } from 'react';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

export default function AuthModalManager() {
  const [currentModal, setCurrentModal] = useState<'signup' | 'signin' | null>(
    null,
  );

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
      {/* Signup */}
      <SignUpModal
        isOpen={currentModal === 'signup'}
        onOpen={() => setCurrentModal('signup')}
        onClose={() => setCurrentModal(null)}
        onSignInRedirect={() => setCurrentModal('signin')}
      />

      {/* Signin */}
      <SignInModal
        isOpen={currentModal === 'signin'}
        onOpen={() => {
          setCurrentModal('signin');
        }}
        onClose={() => setCurrentModal(null)}
        onSignupRedirect={() => setCurrentModal('signup')}
      />
    </div>
  );
}
