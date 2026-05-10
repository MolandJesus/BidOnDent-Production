/**
 * useAuth Hook — Clerk wrapper / continuity-preserving membrane.
 *
 * Pass 286 (2026-05-09): inflated to expose `getToken` per Pass 278 §10
 * step 3 thin-wrapper retrofit recommendation. The wrapper localizes
 * vendor coupling: callers import from this hook instead of
 * `@clerk/clerk-react` directly. Provider-order doctrine (Pass 281)
 * unchanged — the wrapper is a thin re-export, not a new orchestration
 * layer (relay #15 prohibits unnecessary provider nesting / hydration
 * gates / orchestration wrappers).
 *
 * What's wrapped:
 *   - `user`         — sanitized profile (Pass 71+ extractUserProfile shape)
 *   - `isLoading`    — Clerk's `isLoaded` inverted
 *   - `isAuthenticated` — boolean from clerkUser presence
 *   - `signOut`      — Clerk signOut wrapped
 *   - `getToken`     — Clerk `useAuth().getToken` wrapped (Pass 286)
 *
 * What's NOT wrapped (intentional; future passes can extend if owner
 * authorizes):
 *   - Raw Clerk user object (callers needing raw user must import
 *     useUser from @clerk/clerk-react until updateUserMetadata signature
 *     is refactored)
 *   - <SignInButton> / <SignUpButton> JSX components (Pass 278 §10
 *     step 5 owner decision: wrap or accept Tier C)
 *   - ClerkProvider (provider mount; stays at App.tsx outermost per
 *     Pass 281 §3 invariant)
 */

import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { extractUserProfile } from "../services/clerkService";

export interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    user_type: "customer" | "shop" | "insurer" | "admin";
    account_setup_completed: boolean;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  /**
   * Retrieve a Clerk session JWT for edge-function authorization.
   * Returns null if the user is not signed in or the token is unavailable.
   * Pass 286: thin re-export of Clerk's `useAuth().getToken`.
   */
  getToken: () => Promise<string | null>;
}

/**
 * Hook to manage authentication state via Clerk wrapper.
 *
 * @returns {UseAuthReturn} Authentication state and methods.
 */
export function useAuth(): UseAuthReturn {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { getToken: clerkGetToken } = useClerkAuth();

  // Extract user profile from Clerk user object
  const userProfile = clerkUser ? extractUserProfile(clerkUser) : null;

  return {
    user: userProfile,
    isLoading: !isLoaded,
    isAuthenticated: !!clerkUser,
    signOut: async () => {
      await clerkSignOut();
    },
    getToken: clerkGetToken,
  };
}
