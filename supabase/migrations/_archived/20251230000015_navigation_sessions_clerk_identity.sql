-- Harden navigation session persistence around Clerk-authenticated identities.
-- Prior schema keyed sessions by profile UUIDs, while the web runtime sync path uses Clerk IDs.
-- This migration aligns persistence with the authenticated edge boundary and blocks direct browser access.

ALTER TABLE public.navigation_sessions
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

UPDATE public.navigation_sessions AS sessions
SET clerk_user_id = profiles.clerk_user_id
FROM public.profiles AS profiles
WHERE sessions.user_id = profiles.id
  AND sessions.clerk_user_id IS NULL
  AND profiles.clerk_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_navigation_sessions_clerk_user_id
  ON public.navigation_sessions(clerk_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_navigation_sessions_clerk_user_session
  ON public.navigation_sessions(clerk_user_id, session_id);

ALTER TABLE public.navigation_sessions ENABLE ROW LEVEL SECURITY;
