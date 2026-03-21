/**
 * useAuth Hook - Clerk Compatibility Layer
 * 
 * This hook wraps Clerk's useUser hook to provide a simple auth interface
 * for backward compatibility with the existing codebase.
 */

import { useUser, useClerk } from '@clerk/clerk-react';
import { extractUserProfile } from '../services/clerkService';

export interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    user_type: 'customer' | 'shop' | 'insurer' | 'admin';
    account_setup_completed: boolean;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

/**
 * Hook to manage authentication state using Clerk
 * 
 * @returns {UseAuthReturn} Authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  // Extract user profile from Clerk user object
  const userProfile = clerkUser ? extractUserProfile(clerkUser) : null;

  return {
    user: userProfile,
    isLoading: !isLoaded,
    isAuthenticated: !!clerkUser,
    signOut: async () => {
      await clerkSignOut();
    }
  };
}
