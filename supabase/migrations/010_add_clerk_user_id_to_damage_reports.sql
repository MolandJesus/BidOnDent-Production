-- Add clerk_user_id column to damage_reports for Clerk-based authentication
-- This aligns the migration schema with database_init.tsx runtime schema.
-- Reports are stored against clerk_user_id so they persist across sign-out/in cycles.

-- Add clerk_user_id column
ALTER TABLE public.damage_reports
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Make user_id nullable (Clerk users may not have auth.users rows)
ALTER TABLE public.damage_reports
  ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint: must have either user_id or clerk_user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_id_or_clerk_user_id'
    AND conrelid = 'public.damage_reports'::regclass
  ) THEN
    ALTER TABLE public.damage_reports
      ADD CONSTRAINT user_id_or_clerk_user_id
      CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL);
  END IF;
END $$;

-- Index for clerk_user_id lookups
CREATE INDEX IF NOT EXISTS idx_damage_reports_clerk_user_id
  ON public.damage_reports(clerk_user_id);
