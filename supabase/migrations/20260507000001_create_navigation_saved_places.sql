-- ════════════════════════════════════════════════════════════════════════════
-- 20260507000001 — navigation_saved_places (Pass 58 scaffolding)
-- ════════════════════════════════════════════════════════════════════════════
-- F2 from PASS_AUTOPILOT_TRACKER.md: persist user-pinned navigation places
-- (home / work / saved / recent) to Supabase so they survive device + browser
-- changes. Pre-Pass-58, the data lived only in localStorage (see
-- src/app/services/navigation/savedLocations.ts). The hook
-- src/app/hooks/useSavedNavigationLocations.ts continues to use localStorage
-- as the offline mirror; this table provides the cloud backstop.
--
-- Auth model: Clerk (NOT Supabase Auth). The clerk_user_id column carries the
-- Clerk subject string. RLS is enabled with no client policies — all access
-- routes through the edge function under the service role key. This matches
-- the navigation_sessions + notification_preferences pattern already in
-- production.
--
-- Apply via Supabase Studio SQL editor (PG17 db push currently broken — see
-- repo memory supabase-cli-pg17-notes.md). After apply, restart the server
-- edge function so Pass 58 handler stops returning fallback:true.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.navigation_saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  client_id TEXT NOT NULL, -- the localStorage-side id, used for upsert dedup
  label TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL CHECK (category IN ('home', 'work', 'saved', 'recent')),
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clerk_user_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_navigation_saved_places_clerk_user_id
  ON public.navigation_saved_places(clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_navigation_saved_places_clerk_user_category
  ON public.navigation_saved_places(clerk_user_id, category);

-- ──────────────────────────────────────────────────────────────────────────────
-- RLS — deny-by-default; edge function uses service role to read/write
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.navigation_saved_places ENABLE ROW LEVEL SECURITY;

-- Intentionally NO public policies. All access goes through the edge function
-- handler (supabase/functions/server/handlers/navigation_saved_places.ts) which
-- runs under the service role key after requireClerkSession() verification.

-- ──────────────────────────────────────────────────────────────────────────────
-- updated_at trigger (mirrors notification_preferences pattern)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.touch_navigation_saved_places_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_navigation_saved_places_updated_at
  ON public.navigation_saved_places;

CREATE TRIGGER trg_navigation_saved_places_updated_at
  BEFORE UPDATE ON public.navigation_saved_places
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_navigation_saved_places_updated_at();
