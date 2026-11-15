'use client';

// Shows the message an auth route left in the address (/?auth=expired, …) and
// takes it out again, so a reload or a shared address doesn't repeat it.
// Read from window.location, which keeps the homepage static.
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AUTH_NOTICES, AUTH_NOTICE_PARAM } from '@/lib/authNotice';

export default function AuthNotice() {
  useEffect(() => {
    // The Toaster (in the layout) starts listening in its own effect, which
    // runs after this one, so a toast sent right away would be lost. Waiting
    // also lets React's development double run cancel the first one cleanly.
    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      const key = url.searchParams.get(AUTH_NOTICE_PARAM);
      if (key === null) return;

      url.searchParams.delete(AUTH_NOTICE_PARAM);
      window.history.replaceState(window.history.state, '', url);

      if (!Object.prototype.hasOwnProperty.call(AUTH_NOTICES, key)) return;
      const notice = AUTH_NOTICES[key as keyof typeof AUTH_NOTICES];
      (notice.ok ? toast.success : toast.error)(notice.text, {
        duration: 10000,
      });
    });
    return () => clearTimeout(timer);
  }, []);

  return null;
}
