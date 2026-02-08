-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic admin policy and recreate it without recursion

-- Drop the old policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a simpler admin policy that checks email directly from auth.users
-- This avoids querying the profiles table while checking profiles access
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'molalign5@gmail.com'
  );

-- Also add a policy to allow unauthenticated profile creation
-- This allows the admin setup to work before authentication
CREATE POLICY "Allow profile creation for admin setup"
  ON profiles FOR INSERT
  WITH CHECK (
    email = 'molalign5@gmail.com'
    OR auth.uid() = user_id
  );
