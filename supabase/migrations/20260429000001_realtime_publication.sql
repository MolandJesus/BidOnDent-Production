-- ============================================================================
-- Realtime publication membership for live subscriptions
--
-- The Supabase Realtime service only forwards postgres_changes events for
-- tables that are members of the `supabase_realtime` publication. The frontend
-- subscribes to live changes on these tables (see src/app/services/realtime/*),
-- so they all need to be in the publication.
--
-- This migration is idempotent — wrapped in a DO block that checks current
-- membership before adding, and tolerates the publication itself not existing
-- yet (Supabase creates it on first project boot).
-- ============================================================================

DO $$
DECLARE
  pub_exists BOOLEAN;
  tbl TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) INTO pub_exists;

  IF NOT pub_exists THEN
    -- Realtime not enabled on this environment — nothing to do.
    RAISE NOTICE 'supabase_realtime publication not present, skipping';
    RETURN;
  END IF;

  FOREACH tbl IN ARRAY ARRAY['bids', 'damage_reports', 'estimate_requests']
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = tbl
    ) THEN
      RAISE NOTICE 'public.% already in supabase_realtime publication', tbl;
    ELSE
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
      RAISE NOTICE 'added public.% to supabase_realtime publication', tbl;
    END IF;
  END LOOP;
END $$;
