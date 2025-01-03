'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getUserAction } from '../actions/authActions';
import { Shortlink } from '../../lib/types';
import { getAllSlugs, getUserShortlinks } from '../actions/dataActions';

interface UserContextType {
  user: User | null;
  shortlinks: Shortlink[] | null;
  slugs: string[] | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
  refetchShortlinks: () => Promise<void>;
  triggerConfetti: () => void;
  isConfettiActive: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shortlinks, setShortlinks] = useState<Shortlink[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [slugs, setSlugs] = useState<string[] | null>(null);
  const [isConfettiActive, setConfettiActive] = useState(false);

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000); // Stop after 3 seconds
  };

  const fetchSlugs = async () => {
    try {
      const slugs = await getAllSlugs();
      setSlugs(slugs.map((s) => s.slug));
    } catch (error) {
      console.error('Error fetching slugs:', error);
      setSlugs(null);
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUserAction();
      if (!data) {
        setUser(null);
        setShortlinks(null);
      } else {
        setUser(data.user || null);
        if (data.user) {
          await fetchShortlinks();
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching user:', error);
      setUser(null);
      setShortlinks(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlinks = async () => {
    try {
      const links = await getUserShortlinks();
      setShortlinks(links || []);
    } catch (error) {
      console.error('Error fetching shortlinks:', error);
      setShortlinks(null);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch user and slugs concurrently
        await Promise.all([fetchUser(), fetchSlugs()]);
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };

    initializeData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        shortlinks,
        slugs,
        loading,
        refetchUser: fetchUser,
        refetchShortlinks: fetchShortlinks,
        triggerConfetti,
        isConfettiActive,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
