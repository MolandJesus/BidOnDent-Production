-- Fix RLS policies to support clerk_user_id (reports saved via Clerk have NULL user_id)
-- This resolves the bug where reports disappear after logout because RLS only checked user_id.

-- Drop existing broken policies
DROP POLICY IF EXISTS "Users can read their own damage reports" ON public.damage_reports;
DROP POLICY IF EXISTS "Shops and insurers can read all damage reports" ON public.damage_reports;
DROP POLICY IF EXISTS "Users can insert their own damage reports" ON public.damage_reports;
DROP POLICY IF EXISTS "Users can update their own damage reports" ON public.damage_reports;
DROP POLICY IF EXISTS "Users can delete their own damage reports" ON public.damage_reports;

-- Users can read their own reports (via user_id OR clerk_user_id linked to their profile)
CREATE POLICY "Users can read their own damage reports"
  ON public.damage_reports
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR clerk_user_id IN (
      SELECT p.clerk_user_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Shops and insurers can read all damage reports
CREATE POLICY "Shops and insurers can read all damage reports"
  ON public.damage_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.account_type IN ('shop', 'insurer')
    )
  );

-- Users can insert reports (with their user_id or their linked clerk_user_id)
CREATE POLICY "Users can insert their own damage reports"
  ON public.damage_reports
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR clerk_user_id IN (
      SELECT p.clerk_user_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Users can update their own reports
CREATE POLICY "Users can update their own damage reports"
  ON public.damage_reports
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR clerk_user_id IN (
      SELECT p.clerk_user_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR clerk_user_id IN (
      SELECT p.clerk_user_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );

-- Users can delete their own reports
CREATE POLICY "Users can delete their own damage reports"
  ON public.damage_reports
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR clerk_user_id IN (
      SELECT p.clerk_user_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );
