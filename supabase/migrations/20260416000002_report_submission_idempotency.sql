-- ============================================================================
-- Migration: 20260416000002_report_submission_idempotency.sql
-- Purpose:   Add a client request key to damage_reports so duplicate POSTs
--            from retries/double-submits can resolve to the same report.
-- ============================================================================

BEGIN;

ALTER TABLE public.damage_reports
  ADD COLUMN IF NOT EXISTS client_request_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_damage_reports_request_key
  ON public.damage_reports(clerk_user_id, client_request_id)
  WHERE client_request_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON COLUMN public.damage_reports.client_request_id IS
  'Client-generated request key used to dedupe duplicate report submissions for the same clerk user.';

COMMIT;