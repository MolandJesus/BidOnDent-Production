-- Migration 020: Add shop assignment field to damage_reports for insurance claims
-- This enables insurers to assign a specific shop when creating a claim.

ALTER TABLE public.damage_reports
  ADD COLUMN IF NOT EXISTS assigned_shop_clerk_user_id TEXT DEFAULT NULL;

-- Index for looking up reports assigned to a specific shop
CREATE INDEX IF NOT EXISTS idx_damage_reports_assigned_shop
  ON public.damage_reports (assigned_shop_clerk_user_id)
  WHERE assigned_shop_clerk_user_id IS NOT NULL;

COMMENT ON COLUMN public.damage_reports.assigned_shop_clerk_user_id
  IS 'Clerk user ID of the shop assigned to this claim by an insurer';
