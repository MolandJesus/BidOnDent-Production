-- Migration: Add actor_id, object_id, outcome columns to platform_activity_events
-- Phase 3.2 — Event Capture Quality
-- These columns enable structured event tracking per the Soft Launch Hardening Plan.

ALTER TABLE public.platform_activity_events
  ADD COLUMN IF NOT EXISTS actor_id TEXT,
  ADD COLUMN IF NOT EXISTS object_id TEXT,
  ADD COLUMN IF NOT EXISTS outcome TEXT;

-- Index for actor-based event lookup
CREATE INDEX IF NOT EXISTS idx_platform_activity_events_actor
  ON public.platform_activity_events(actor_id);
