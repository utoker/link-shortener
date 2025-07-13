// src/app/context/UserContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  startTransition,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

import {
  getUserAction, // ActionResult contract
} from '@/app/actions/auth';

import type { Link, Slug } from '@/lib/types/database';
import { getAllSlugs, getUserLinks } from '../actions/data';

/* ------------------------------------------------------------------------ */
/* Context shape                                                            */
/* ------------------------------------------------------------------------ */
interface UserContextType {
  user: User | null;
  links: Link[] | null;
  slugs: Slug[] | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
  refetchLinks: () => Promise<void>;
  triggerConfetti: () => void;
  isConfettiActive: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/* ------------------------------------------------------------------------ */
/* Provider                                                                 */
/* ------------------------------------------------------------------------ */
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<Link[] | null>(null);
  const [slugs, setSlugs] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfettiActive, setConfettiActive] = useState(false);

  /* ----------------------------- helpers --------------------------------- */
  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  };

  const fetchSlugs = async () => {
    try {
      const list = await getAllSlugs(); // still returns string[]
      setSlugs(list.map((s) => s.slug));
    } catch (err) {
      console.error('Error fetching slugs:', err);
      setSlugs(null);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await getUserLinks({ success: false }, new FormData());
      if (res.success) {
        setLinks(res.links ?? []);
      } else {
        if (res.formError) toast.error(res.formError);
        setLinks(null);
      }
    } catch (err) {
      console.error('Error fetching links:', err);
      setLinks(null);
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await getUserAction({ success: false }, new FormData());
      if (!res.success || !res.user) {
        setUser(null);
        setLinks(null);
      } else {
        setUser(res.user);
        await fetchLinks();
      }
    } catch (err) {
      console.error('Unexpected error fetching user:', err);
      setUser(null);
      setLinks(null);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- initial load ------------------------------ */
  useEffect(() => {
    startTransition(async () => {
      await Promise.all([fetchUser(), fetchSlugs()]);
    });
  }, []);

  /* ----------------------------- value ----------------------------------- */
  const value: UserContextType = {
    user,
    links,
    slugs,
    loading,
    refetchUser: fetchUser,
    refetchLinks: fetchLinks,
    triggerConfetti,
    isConfettiActive,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/* ------------------------------------------------------------------------ */
/* Hook                                                                     */
/* ------------------------------------------------------------------------ */
export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return ctx;
};
