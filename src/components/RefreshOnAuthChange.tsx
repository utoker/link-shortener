'use client';

// Server-rendered pages show what the signed-in user may see, but signing in
// or out happens in a modal without a page load. Re-render the page when the
// user changes after it has loaded.
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';

export default function RefreshOnAuthChange() {
  const { user, loading } = useUserContext();
  const router = useRouter();
  const userId = user?.id ?? null;
  const seen = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (loading) return;
    if (seen.current !== undefined && seen.current !== userId) router.refresh();
    seen.current = userId;
  }, [loading, userId, router]);

  return null;
}
