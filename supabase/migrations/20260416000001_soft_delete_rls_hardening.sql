-- ============================================================================
-- Migration: 20260416000001_soft_delete_rls_hardening.sql
-- Purpose:   Add deleted_at IS NULL to all SELECT policies on tables that
--            support soft delete (vehicles, damage_reports, bids,
--            job_assignments). Closes the gap where direct Realtime
--            subscriptions or anon-client queries could see soft-deleted rows.
--
-- Tables affected: vehicles, damage_reports, bids, job_assignments
-- Non-SELECT policies are unchanged (INSERT/UPDATE/DELETE don't need the guard).
-- ============================================================================

BEGIN;

-- ──── vehicles ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can read their own vehicles" ON public.vehicles;

CREATE POLICY "Users can read their own vehicles"
  ON public.vehicles FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      clerk_user_id = requesting_clerk_user_id()
      OR auth.uid() = user_id
    )
  );

-- ──── damage_reports ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can read their own damage reports" ON public.damage_reports;

CREATE POLICY "Users can read their own damage reports"
  ON public.damage_reports FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      clerk_user_id = requesting_clerk_user_id()
      OR auth.uid() = user_id
    )
  );

DROP POLICY IF EXISTS "Shops and insurers can read all damage reports" ON public.damage_reports;

CREATE POLICY "Shops and insurers can read all damage reports"
  ON public.damage_reports FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
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
    )
  );

-- ──── bids ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can read bids" ON public.bids;

CREATE POLICY "Authenticated users can read bids"
  ON public.bids FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      requesting_clerk_user_id() IS NOT NULL
      OR auth.role() = 'authenticated'
    )
  );

-- ──── job_assignments ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Participants can read their own job assignments" ON public.job_assignments;

CREATE POLICY "Participants can read their own job assignments"
  ON public.job_assignments FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      shop_clerk_user_id = requesting_clerk_user_id()
      OR customer_clerk_user_id = requesting_clerk_user_id()
      OR insurer_clerk_user_id = requesting_clerk_user_id()
      OR customer_user_id = auth.uid()
      OR shop_user_id = auth.uid()
      OR insurer_user_id = auth.uid()
    )
  );

COMMIT;
