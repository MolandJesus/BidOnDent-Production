-- Migration 020: Rewrite all RLS policies to support Clerk JWT authentication.
--
-- Prior policies used auth.uid() (Supabase Auth) which is NULL for Clerk users.
-- New policies use requesting_clerk_user_id() which extracts the Clerk user ID
-- from request.jwt.claims->>'sub'. Legacy auth.uid() fallback preserved for
-- backward compatibility.
--
-- Prerequisite: A Clerk JWT template named "supabase" must be configured in the
-- Clerk Dashboard and signed with Supabase's JWT secret so that PostgREST can
-- verify the token and populate request.jwt.claims.

-- Helper function: extract Clerk user ID from JWT sub claim.
CREATE OR REPLACE FUNCTION public.requesting_clerk_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '');
$$;

-- ============================================================================
-- profiles
-- ============================================================================
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Users can read all profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

-- ============================================================================
-- vehicles
-- ============================================================================
DROP POLICY IF EXISTS "Users can read their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;

CREATE POLICY "Users can read their own vehicles"
  ON public.vehicles FOR SELECT
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can insert their own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own vehicles"
  ON public.vehicles FOR UPDATE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own vehicles"
  ON public.vehicles FOR DELETE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

-- ============================================================================
-- damage_reports
-- ============================================================================
DROP POLICY IF EXISTS "Users can read their own damage reports" ON public.damage_reports;
DROP POLICY IF EXISTS "Shops and insurers can read all damage reports" ON public.damage_reports;
DROP POLICY IF EXISTS "Users can insert their own damage reports" ON public.damage_reports;
DROP POLICY IF EXISTS "Users can update their own damage reports" ON public.damage_reports;
DROP POLICY IF EXISTS "Users can delete their own damage reports" ON public.damage_reports;

CREATE POLICY "Users can read their own damage reports"
  ON public.damage_reports FOR SELECT
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Shops and insurers can read all damage reports"
  ON public.damage_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.clerk_user_id = requesting_clerk_user_id()
      AND profiles.account_type IN ('shop', 'insurer')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.account_type IN ('shop', 'insurer')
    )
  );

CREATE POLICY "Users can insert their own damage reports"
  ON public.damage_reports FOR INSERT
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own damage reports"
  ON public.damage_reports FOR UPDATE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own damage reports"
  ON public.damage_reports FOR DELETE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

-- ============================================================================
-- bids
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can read bids" ON public.bids;
DROP POLICY IF EXISTS "Authenticated shops can manage bids" ON public.bids;

CREATE POLICY "Authenticated users can read bids"
  ON public.bids FOR SELECT
  USING (
    requesting_clerk_user_id() IS NOT NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated shops can manage bids"
  ON public.bids FOR ALL
  USING (
    clerk_shop_user_id = requesting_clerk_user_id()
    OR auth.uid() = shop_user_id
  )
  WITH CHECK (
    clerk_shop_user_id = requesting_clerk_user_id()
    OR auth.uid() = shop_user_id
  );

-- ============================================================================
-- job_assignments (previously had NO policies — was deny-all for direct access)
-- ============================================================================
DROP POLICY IF EXISTS "Participants can read their own job assignments" ON public.job_assignments;
DROP POLICY IF EXISTS "Shops can manage their own job assignments" ON public.job_assignments;

CREATE POLICY "Participants can read their own job assignments"
  ON public.job_assignments FOR SELECT
  USING (
    shop_clerk_user_id = requesting_clerk_user_id()
    OR customer_clerk_user_id = requesting_clerk_user_id()
    OR insurer_clerk_user_id = requesting_clerk_user_id()
    OR customer_user_id = auth.uid()
    OR shop_user_id = auth.uid()
    OR insurer_user_id = auth.uid()
  );

CREATE POLICY "Shops can manage their own job assignments"
  ON public.job_assignments FOR ALL
  USING (
    shop_clerk_user_id = requesting_clerk_user_id()
    OR shop_user_id = auth.uid()
  )
  WITH CHECK (
    shop_clerk_user_id = requesting_clerk_user_id()
    OR shop_user_id = auth.uid()
  );

-- ============================================================================
-- estimate_requests (was USING(true) — wide open; now scoped to owner + shops)
-- ============================================================================
DROP POLICY IF EXISTS estimate_requests_service_role_all ON public.estimate_requests;
DROP POLICY IF EXISTS "Customers can read their own estimate requests" ON public.estimate_requests;
DROP POLICY IF EXISTS "Customers can insert their own estimate requests" ON public.estimate_requests;
DROP POLICY IF EXISTS "Shops can read estimate requests sent to them" ON public.estimate_requests;

CREATE POLICY "Customers can read their own estimate requests"
  ON public.estimate_requests FOR SELECT
  USING (clerk_customer_user_id = requesting_clerk_user_id());

CREATE POLICY "Customers can insert their own estimate requests"
  ON public.estimate_requests FOR INSERT
  WITH CHECK (clerk_customer_user_id = requesting_clerk_user_id());

CREATE POLICY "Shops can read estimate requests sent to them"
  ON public.estimate_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.clerk_user_id = requesting_clerk_user_id()
      AND profiles.account_type = 'shop'
    )
  );

-- ============================================================================
-- platform_activity_events (add admin SELECT; keep public INSERT)
-- ============================================================================
DROP POLICY IF EXISTS "Public can insert platform activity events" ON public.platform_activity_events;
DROP POLICY IF EXISTS "Admins can read platform activity events" ON public.platform_activity_events;

CREATE POLICY "Public can insert platform activity events"
  ON public.platform_activity_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read platform activity events"
  ON public.platform_activity_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.clerk_user_id = requesting_clerk_user_id()
      AND profiles.is_admin = TRUE
    )
  );

-- ============================================================================
-- shop_profiles (previously no policies — deny-all for direct access)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can read shop profiles" ON public.shop_profiles;
DROP POLICY IF EXISTS "Shop owners can manage their own profile" ON public.shop_profiles;

CREATE POLICY "Authenticated users can read shop profiles"
  ON public.shop_profiles FOR SELECT
  USING (requesting_clerk_user_id() IS NOT NULL OR auth.role() = 'authenticated');

CREATE POLICY "Shop owners can manage their own profile"
  ON public.shop_profiles FOR ALL
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR user_id = auth.uid()
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR user_id = auth.uid()
  );

-- ============================================================================
-- insurer_profiles (previously no policies — deny-all for direct access)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can read insurer profiles" ON public.insurer_profiles;
DROP POLICY IF EXISTS "Insurer owners can manage their own profile" ON public.insurer_profiles;

CREATE POLICY "Authenticated users can read insurer profiles"
  ON public.insurer_profiles FOR SELECT
  USING (requesting_clerk_user_id() IS NOT NULL OR auth.role() = 'authenticated');

CREATE POLICY "Insurer owners can manage their own profile"
  ON public.insurer_profiles FOR ALL
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR user_id = auth.uid()
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR user_id = auth.uid()
  );

-- ============================================================================
-- notification_preferences — already uses Clerk JWT (no change needed)
-- shop_service_areas — already uses Clerk JWT (no change needed)
-- ============================================================================
