-- Add 'accepted' as a terminal status for estimate_requests
-- Allows customers to formally accept a shop's estimate response
-- The status machine becomes: pending → viewed → responded → accepted | declined

ALTER TABLE estimate_requests
  DROP CONSTRAINT IF EXISTS estimate_requests_status_check;

ALTER TABLE estimate_requests
  ADD CONSTRAINT estimate_requests_status_check
  CHECK (status IN ('pending', 'viewed', 'responded', 'declined', 'accepted'));
