-- ============================================================================
-- Migration 011b: Canonical catchup — bring migrations folder in line with prod
-- ============================================================================
-- CONTEXT: Migrations 001–011 create the core of the public schema, but several
-- tables and columns that later migrations (012, 024, 025, 026, 027) reference
-- were never added via a migration. In production they exist only because of:
--   1. Runtime edge-function schema init (supabase/functions/server/database_init.tsx)
--   2. One-off dashboard pastes (database-setup/business_intake_and_activity.sql,
--      plus ad-hoc SQL editor runs for estimate_requests and Clerk columns)
--
-- This meant a fresh environment rebuilt from supabase/migrations/ alone would
-- fail partway through 012 with "relation does not exist" — which is exactly
-- how the staging bootstrap broke on 2026-04-15.
--
-- This migration closes the gap. Every statement is idempotent:
--   - Re-running against prod is a no-op (everything already exists).
--   - Running against a fresh DB fills in exactly what's missing so 012+ apply.
--
-- Filename is "011b" so it lexicographically sorts between 011_* and 012_*.
-- ============================================================================

SET search_path TO public, extensions;


-- ============================================================================
-- profiles: add columns referenced by migration 024 and edge-function handlers
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;


-- ============================================================================
-- vehicles: add clerk_user_id, relax NOT NULL, add identity check constraint
-- ============================================================================
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'vehicles'
    AND column_name = 'user_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.vehicles ALTER COLUMN user_id DROP NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vehicles_user_id_or_clerk_user_id'
  ) THEN
    ALTER TABLE public.vehicles
    ADD CONSTRAINT vehicles_user_id_or_clerk_user_id
    CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vehicles_clerk_user_id
  ON public.vehicles(clerk_user_id);


-- ============================================================================
-- bids: add all Clerk-era columns + identity check so 024/026 can reference them
-- ============================================================================
ALTER TABLE public.bids
  ADD COLUMN IF NOT EXISTS clerk_shop_user_id TEXT,
  ADD COLUMN IF NOT EXISTS shop_name TEXT,
  ADD COLUMN IF NOT EXISTS shop_email TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS shop_rating DECIMAL(3, 2),
  ADD COLUMN IF NOT EXISTS shop_reviews INTEGER,
  ADD COLUMN IF NOT EXISTS shop_distance TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'bids'
    AND column_name = 'shop_user_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.bids ALTER COLUMN shop_user_id DROP NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bids_shop_identity_check'
  ) THEN
    ALTER TABLE public.bids
    ADD CONSTRAINT bids_shop_identity_check
    CHECK (shop_user_id IS NOT NULL OR clerk_shop_user_id IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bids_clerk_shop_user_id
  ON public.bids(clerk_shop_user_id);


-- ============================================================================
-- shop_interest_submissions (landing-page shop partnership form)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shop_interest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL,
  dmv_registration_number TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  website TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_interest_submissions_status
  ON public.shop_interest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_shop_interest_submissions_created_at
  ON public.shop_interest_submissions(created_at DESC);

ALTER TABLE public.shop_interest_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public shop submissions"
  ON public.shop_interest_submissions;
CREATE POLICY "Allow public shop submissions"
  ON public.shop_interest_submissions FOR INSERT
  WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at ON public.shop_interest_submissions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.shop_interest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- insurer_interest_submissions (landing-page insurer partnership form)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.insurer_interest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurer_interest_submissions_status
  ON public.insurer_interest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_insurer_interest_submissions_created_at
  ON public.insurer_interest_submissions(created_at DESC);

ALTER TABLE public.insurer_interest_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insurer submissions"
  ON public.insurer_interest_submissions;
CREATE POLICY "Allow public insurer submissions"
  ON public.insurer_interest_submissions FOR INSERT
  WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at ON public.insurer_interest_submissions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.insurer_interest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- platform_activity_events (funnel / waitlist event tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.platform_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_activity_events_type
  ON public.platform_activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_platform_activity_events_created_at
  ON public.platform_activity_events(created_at DESC);

ALTER TABLE public.platform_activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public event inserts"
  ON public.platform_activity_events;
CREATE POLICY "Allow public event inserts"
  ON public.platform_activity_events FOR INSERT
  WITH CHECK (true);


-- ============================================================================
-- public_partner_shops (public-facing map directory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.public_partner_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC(3, 2) DEFAULT 4.5,
  phone_number TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_partner_shops_active
  ON public.public_partner_shops(is_active);
CREATE INDEX IF NOT EXISTS idx_public_partner_shops_zip_code
  ON public.public_partner_shops(zip_code);

ALTER TABLE public.public_partner_shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read partner shops"
  ON public.public_partner_shops;
CREATE POLICY "Allow public read partner shops"
  ON public.public_partner_shops FOR SELECT
  USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON public.public_partner_shops;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.public_partner_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- job_assignments (awarded repair jobs — both Supabase-auth and Clerk columns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_report_id UUID REFERENCES public.damage_reports(id) ON DELETE CASCADE NOT NULL,
  customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  insurer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_clerk_user_id TEXT,
  shop_clerk_user_id TEXT,
  insurer_clerk_user_id TEXT,
  bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'awaiting_parts', 'completed', 'cancelled')),
  scheduled_start_at TIMESTAMPTZ,
  estimated_completion_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill Clerk columns in case the table pre-dated them
ALTER TABLE public.job_assignments
  ADD COLUMN IF NOT EXISTS customer_clerk_user_id TEXT,
  ADD COLUMN IF NOT EXISTS shop_clerk_user_id TEXT,
  ADD COLUMN IF NOT EXISTS insurer_clerk_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_job_assignments_customer_user_id
  ON public.job_assignments(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_shop_user_id
  ON public.job_assignments(shop_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_insurer_user_id
  ON public.job_assignments(insurer_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_shop_clerk_user_id
  ON public.job_assignments(shop_clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_status
  ON public.job_assignments(status);
CREATE INDEX IF NOT EXISTS idx_job_assignments_damage_report_id
  ON public.job_assignments(damage_report_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_bid_id
  ON public.job_assignments(bid_id);

ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_updated_at ON public.job_assignments;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.job_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- estimate_requests (customer -> shop estimate intake from map directory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.estimate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_customer_user_id TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  shop_id INTEGER,
  shop_name TEXT,
  description TEXT NOT NULL,
  timeline TEXT DEFAULT 'flexible' CHECK (timeline IN ('urgent', 'this-week', 'flexible')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'responded', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.estimate_requests ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_estimate_requests_updated_at ON public.estimate_requests;
CREATE TRIGGER set_estimate_requests_updated_at
  BEFORE UPDATE ON public.estimate_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
