'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * Redirects to /auth/login if the user is not authenticated.
 * Waits until the initial auth check (fetchUser) has completed before redirecting,
 * preventing false redirects on page refresh.
 *
 * @returns { user, isLoading, isInitialized }
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  return { user, isLoading, isInitialized };
}
