-- ============================================================================
-- Pass 59 (2026-05-07) — Real-time partner-shop availability scaffolding
-- ============================================================================
-- Adds live-availability columns to shop_profiles so customers can see which
-- nearby shops are currently open for new work, with realtime updates as the
-- shop owner toggles state. Schema decision: Option A (extend shop_profiles)
-- chosen over Option B (separate shop_availability table) because:
--
--   * Single source of truth for shop state — joining is unnecessary.
--   * Lower realtime overhead — one row per shop instead of two.
--   * Existing FOR ALL RLS policy on shop_profiles already covers UPDATE
--     access for the shop owner (no new policy needed); see line ~693 of
--     20251230000001_full_schema.sql.
--
-- Audit-trail concerns (history of availability flips) are deferred — if the
-- product needs them, a separate shop_availability_events log table can be
-- added without disturbing this column-shape.
--
-- WRITE-ONLY migration: not applied locally because the Supabase CLI db push
-- is broken under PG17 (see repo memory `supabase-cli-pg17-notes.md`). Owner
-- applies via Supabase Studio. KI-115 tracks the unapplied state with apply
-- steps + verification curl + removal trigger.
-- ============================================================================

-- 1. Columns ────────────────────────────────────────────────────────────────
ALTER TABLE public.shop_profiles
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS availability_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS availability_note TEXT;

COMMENT ON COLUMN public.shop_profiles.is_available IS
  'Pass 59: shop''s self-reported live availability flag. Defaults false; shop owner toggles via /shop-availability PUT.';
COMMENT ON COLUMN public.shop_profiles.available_until IS
  'Pass 59: optional auto-expiry for is_available. NULL = no expiry. Client may treat past values as is_available=false.';
COMMENT ON COLUMN public.shop_profiles.availability_updated_at IS
  'Pass 59: server-side stamp of the last availability mutation. Useful for staleness checks.';
COMMENT ON COLUMN public.shop_profiles.availability_note IS
  'Pass 59: optional short note from the shop, e.g. "Closing in 30 min". Capped at 200 chars by handler validation.';

-- 2. Marker-query index ─────────────────────────────────────────────────────
-- Customers ask "which shops near me are currently available" — a partial
-- index keeps that query cheap as the shop pool grows.
CREATE INDEX IF NOT EXISTS idx_shop_profiles_is_available
  ON public.shop_profiles (is_available, availability_updated_at DESC)
  WHERE is_available = true;

-- 3. Realtime publication membership ────────────────────────────────────────
-- shop_profiles is NOT yet in supabase_realtime (see 20260429000001 — only
-- bids, damage_reports, estimate_requests are members). Add it idempotently,
-- mirroring that file's pattern so re-runs are safe.
DO $$
DECLARE
  pub_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) INTO pub_exists;

  IF NOT pub_exists THEN
    RAISE NOTICE 'supabase_realtime publication not present, skipping shop_profiles add';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'shop_profiles'
  ) THEN
    RAISE NOTICE 'public.shop_profiles already in supabase_realtime publication';
  ELSE
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_profiles';
    RAISE NOTICE 'added public.shop_profiles to supabase_realtime publication';
  END IF;
END $$;
