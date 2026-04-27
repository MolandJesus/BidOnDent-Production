-- ============================================================================
-- Migration: 20260423000001_remote_rls_backfill.sql
-- Purpose:   Backfill RLS and canonical policies on public-facing tables for
--            environments that drifted away from the canonical schema.
--
-- Safety:
-- - Idempotent: only touches tables/functions/policies when they exist.
-- - Narrow: targets the public tables called out by Supabase security alerts.
-- - Compatible with partially-managed remote environments and broken
--   migration history.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.requesting_clerk_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '');
$$;

DO $$
BEGIN
  IF to_regclass('public.shop_interest_submissions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.shop_interest_submissions ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'shop_interest_submissions'
        AND policyname = 'Allow validated shop submissions'
    ) THEN
      EXECUTE $sql$
        CREATE POLICY "Allow validated shop submissions"
          ON public.shop_interest_submissions
          FOR INSERT
          WITH CHECK (
            length(trim(coalesce(shop_name, ''))) > 0
            AND length(trim(coalesce(email, ''))) > 2
            AND length(trim(coalesce(contact_person, ''))) > 0
          )
      $sql$;
    END IF;
  END IF;

  IF to_regclass('public.insurer_interest_submissions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.insurer_interest_submissions ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'insurer_interest_submissions'
        AND policyname = 'Allow validated insurer submissions'
    ) THEN
      EXECUTE $sql$
        CREATE POLICY "Allow validated insurer submissions"
          ON public.insurer_interest_submissions
          FOR INSERT
          WITH CHECK (
            length(trim(coalesce(company_name, ''))) > 0
            AND length(trim(coalesce(email, ''))) > 2
            AND length(trim(coalesce(contact_person, ''))) > 0
          )
      $sql$;
    END IF;
  END IF;

  IF to_regclass('public.platform_activity_events') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.platform_activity_events ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'platform_activity_events'
        AND policyname = 'Allow validated event inserts'
    ) THEN
      EXECUTE $sql$
        CREATE POLICY "Allow validated event inserts"
          ON public.platform_activity_events
          FOR INSERT
          WITH CHECK (length(trim(coalesce(event_type, ''))) > 0)
      $sql$;
    END IF;

    IF to_regclass('public.profiles') IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name IN ('clerk_user_id', 'is_admin')
        GROUP BY table_schema, table_name
        HAVING count(*) = 2
      )
      AND NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'platform_activity_events'
          AND policyname = 'Admins can read platform activity events'
      ) THEN
      EXECUTE $sql$
        CREATE POLICY "Admins can read platform activity events"
          ON public.platform_activity_events
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1
              FROM public.profiles
              WHERE profiles.clerk_user_id = requesting_clerk_user_id()
                AND profiles.is_admin = TRUE
            )
          )
      $sql$;
    END IF;
  END IF;

  IF to_regclass('public.job_assignments') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'job_assignments'
        AND policyname = 'Participants can read their own job assignments'
    ) THEN
      EXECUTE $sql$
        CREATE POLICY "Participants can read their own job assignments"
          ON public.job_assignments FOR SELECT
          USING (
            shop_clerk_user_id = requesting_clerk_user_id()
            OR customer_clerk_user_id = requesting_clerk_user_id()
            OR insurer_clerk_user_id = requesting_clerk_user_id()
            OR customer_user_id = auth.uid()
            OR shop_user_id = auth.uid()
            OR insurer_user_id = auth.uid()
          )
      $sql$;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'job_assignments'
        AND policyname = 'Shops can manage their own job assignments'
    ) THEN
      EXECUTE $sql$
        CREATE POLICY "Shops can manage their own job assignments"
          ON public.job_assignments FOR ALL
          USING (
            shop_clerk_user_id = requesting_clerk_user_id()
            OR shop_user_id = auth.uid()
          )
          WITH CHECK (
            shop_clerk_user_id = requesting_clerk_user_id()
            OR shop_user_id = auth.uid()
          )
      $sql$;
    END IF;
  END IF;

  IF to_regclass('public.notification_preferences') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'notification_preferences'
        AND policyname = 'Users can manage their own notification preferences'
    ) THEN
      EXECUTE $sql$
        CREATE POLICY "Users can manage their own notification preferences"
          ON public.notification_preferences
          FOR ALL
          USING (clerk_user_id = requesting_clerk_user_id())
      $sql$;
    END IF;
  END IF;

  IF to_regclass('public.shop_service_areas') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.shop_service_areas ENABLE ROW LEVEL SECURITY';

    IF to_regclass('public.shop_profiles') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'shop_service_areas'
          AND policyname = 'Shop owners can manage their own service areas'
      ) THEN
      EXECUTE $sql$
        CREATE POLICY "Shop owners can manage their own service areas"
          ON public.shop_service_areas
          FOR ALL
          USING (
            shop_profile_id IN (
              SELECT id
              FROM public.shop_profiles
              WHERE clerk_user_id = requesting_clerk_user_id()
            )
          )
      $sql$;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'shop_service_areas'
        AND policyname = 'Authenticated users can view active service areas'
    ) THEN
      EXECUTE $sql$
        CREATE POLICY "Authenticated users can view active service areas"
          ON public.shop_service_areas
          FOR SELECT
          USING (is_active = TRUE)
      $sql$;
    END IF;
  END IF;
END
$$;

COMMIT;
