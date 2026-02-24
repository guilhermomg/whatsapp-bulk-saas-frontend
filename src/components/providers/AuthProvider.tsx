'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    // Rehydrate persisted state from localStorage first, then validate token with server
    useAuthStore.persist.rehydrate();
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
