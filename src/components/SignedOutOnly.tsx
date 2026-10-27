'use client';

import { useUserContext } from '../app/context/UserContext';

// Hides its (server-rendered) children once a signed-in user is known, so the
// page itself can stay static instead of checking auth on every request.
const SignedOutOnly = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserContext();

  return user ? null : children;
};

export default SignedOutOnly;
