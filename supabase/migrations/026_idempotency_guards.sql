-- Migration: Idempotency guards for launch-critical write flows
-- Phase 3.3 — Idempotency Verification
-- Adds unique constraints to prevent duplicate bids and job assignments.

-- One active bid per shop per damage report
-- (rejected/withdrawn bids are excluded, allowing re-bidding after rejection)
CREATE UNIQUE INDEX IF NOT EXISTS uq_bids_report_shop
  ON public.bids(damage_report_id, clerk_shop_user_id)
  WHERE status NOT IN ('rejected', 'withdrawn');

-- One active job assignment per damage report
-- (cancelled assignments are excluded, allowing re-assignment after cancellation)
CREATE UNIQUE INDEX IF NOT EXISTS uq_job_assignments_report
  ON public.job_assignments(damage_report_id)
  WHERE status NOT IN ('cancelled');
