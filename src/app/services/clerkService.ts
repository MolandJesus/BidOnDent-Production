/**
 * Clerk Authentication Service
 * 
 * Provides a simplified interface for Clerk authentication
 * Stores user profile data in Clerk's metadata instead of Supabase
 */

export type UserType = 'customer' | 'shop' | 'insurer';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  user_type: UserType;
  account_setup_completed: boolean;
}

/**
 * Extract user profile from Clerk user object
 * This is the main way to get user data in the app
 */
export function extractUserProfile(clerkUser: any): UserProfile | null {
  if (!clerkUser) return null;
  
  const metadata = clerkUser.unsafeMetadata || {};
  const rawType = metadata.user_type as string | undefined;
  const normalizedType = rawType === 'admin' ? 'customer' : rawType;
  
  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
    name: (metadata.name as string) || '',
    phone: (metadata.phone as string) || '',
    user_type: (normalizedType as UserType) || 'customer',
    account_setup_completed: (metadata.account_setup_completed as boolean) || false,
  };
}

/**
 * Update user profile in Clerk metadata
 * Returns the user object with updated metadata
 */
export async function updateUserMetadata(
  clerkUser: any,
  updates: Partial<Omit<UserProfile, 'id' | 'email'>>
) {
  if (!clerkUser) throw new Error('No user provided');
  
  await clerkUser.update({
    unsafeMetadata: {
      ...clerkUser.unsafeMetadata,
      ...updates,
    },
  });
}