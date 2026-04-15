-- Migration 015: Add claim decision fields to damage_reports
-- Allows insurers to persist claim approval/denial decisions

ALTER TABLE damage_reports
  ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_amount NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS denial_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_decision_date TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_decided_by TEXT DEFAULT NULL;

-- Index for querying claims by status
CREATE INDEX IF NOT EXISTS idx_damage_reports_claim_status
  ON damage_reports (claim_status)
  WHERE claim_status IS NOT NULL;

COMMENT ON COLUMN damage_reports.claim_status IS 'Claim decision: pending, approved, denied';
COMMENT ON COLUMN damage_reports.approved_amount IS 'Dollar amount approved by insurer';
COMMENT ON COLUMN damage_reports.denial_reason IS 'Reason for claim denial';
COMMENT ON COLUMN damage_reports.claim_decision_date IS 'When the claim decision was made';
COMMENT ON COLUMN damage_reports.claim_decided_by IS 'Clerk user ID of the insurer who decided';
