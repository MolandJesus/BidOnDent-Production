-- ============================================================================
-- Migration 012: Harden Row Level Security policies
-- ============================================================================
-- CONTEXT: Several tables have overly permissive USING(true) / WITH CHECK(true)
-- policies from early development. This migration tightens them for production.
--
-- ARCHITECTURE NOTE (Clerk + Supabase):
-- This app uses Clerk for identity and Supabase for persistence.
-- Frontend requests hit Supabase with the anon key (role = 'anon').
-- Edge functions use service_role key (bypasses RLS entirely).
-- Therefore auth.uid() is NULL for most frontend operations.
--
-- STRATEGY:
-- 1. profiles         — restrict SELECT to own row or authenticated users
-- 2. submissions      — add required-field validation (public INSERT stays)
-- 3. activity events  — add required-field validation (public INSERT stays)
-- 4. partner shops    — keep public read (intentionally public data)
-- ============================================================================


-- ──────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES — tighten SELECT from USING(true) to per-user access
-- ──────────────────────────────────────────────────────────────────────────────
-- Current: ANY anonymous request can read ALL profiles (exposes PII).
-- Fix: Users can only read their own profile. Shops/insurers get limited read.
-- Edge functions (service_role) are unaffected — they bypass RLS entirely.

DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;

-- Users can read their own profile via Supabase Auth uid
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Shops and insurers can see other profiles (needed for bid/job workflows)
CREATE POLICY "Business users can read profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS viewer
      WHERE viewer.user_id = auth.uid()
      AND viewer.account_type IN ('shop', 'insurer')
    )
  );


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. SHOP INTEREST SUBMISSIONS — add field validation
-- ──────────────────────────────────────────────────────────────────────────────
-- Current: WITH CHECK(true) — anyone can insert empty/garbage rows.
-- Fix: Require non-empty required fields. Still allows anonymous submissions
-- (which is correct — this is a public sign-up form).

DROP POLICY IF EXISTS "Allow public shop submissions"
  ON public.shop_interest_submissions;

CREATE POLICY "Allow validated shop submissions"
  ON public.shop_interest_submissions
  FOR INSERT
  WITH CHECK (
    length(trim(coalesce(shop_name, ''))) > 0
    AND length(trim(coalesce(email, ''))) > 2
    AND length(trim(coalesce(contact_person, ''))) > 0
  );


-- ──────────────────────────────────────────────────────────────────────────────
-- 3. INSURER INTEREST SUBMISSIONS — add field validation
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public insurer submissions"
  ON public.insurer_interest_submissions;

CREATE POLICY "Allow validated insurer submissions"
  ON public.insurer_interest_submissions
  FOR INSERT
  WITH CHECK (
    length(trim(coalesce(company_name, ''))) > 0
    AND length(trim(coalesce(email, ''))) > 2
    AND length(trim(coalesce(contact_person, ''))) > 0
  );


-- ──────────────────────────────────────────────────────────────────────────────
-- 4. PLATFORM ACTIVITY EVENTS — require event_type
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public event inserts"
  ON public.platform_activity_events;

CREATE POLICY "Allow validated event inserts"
  ON public.platform_activity_events
  FOR INSERT
  WITH CHECK (
    length(trim(coalesce(event_type, ''))) > 0
  );


-- ──────────────────────────────────────────────────────────────────────────────
-- 5. PUBLIC PARTNER SHOPS — keep public read (no change)
-- ──────────────────────────────────────────────────────────────────────────────
-- "Allow public read partner shops" USING(true) is intentionally correct.
-- This is the public shop directory visible on the landing page.
-- No PII is exposed — only business name, location, specialties, rating.


-- ============================================================================
-- FUTURE: Clerk JWT Integration
-- ============================================================================
-- For full production security with Clerk:
-- 1. Configure Clerk to issue Supabase-compatible JWTs
-- 2. Set the JWT secret in Supabase Dashboard → Settings → API
-- 3. Frontend: supabase.auth.setSession() with Clerk token
-- 4. Then auth.uid() will resolve to the Clerk user ID
-- 5. Update profiles table to reference clerk_user_id in RLS policies
--
-- Until then, edge functions (service_role) handle all authenticated queries.
-- The policies above protect against direct anonymous API abuse.
-- ============================================================================
