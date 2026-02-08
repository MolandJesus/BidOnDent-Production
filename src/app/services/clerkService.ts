/**
 * Clerk Authentication Service
 * 
 * Provides a simplified interface for Clerk authentication
 * Stores user profile data in Clerk's metadata instead of Supabase
 */

export type UserType = 'customer' | 'shop' | 'insurer' | 'admin';

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
  
  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
    name: (metadata.name as string) || '',
    phone: (metadata.phone as string) || '',
    user_type: (metadata.user_type as UserType) || 'customer',
    account_setup_completed: (metadata.account_setup_completed as boolean) || false,
  };
}

/**
 * Check if user is admin based on Clerk data
 */
export function isAdminUser(userProfile: UserProfile | null): boolean {
  if (!userProfile) return false;
  
  return (
    userProfile.user_type === 'admin' ||
    userProfile.email.toLowerCase() === 'bidondent@gmail.com'
  );
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