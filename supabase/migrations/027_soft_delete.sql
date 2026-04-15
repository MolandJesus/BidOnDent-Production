-- Migration: Add soft delete support to launch-critical tables
-- Phase 3.4 — Minimal Soft Delete
-- Adds deleted_at column to damage_reports, bids, job_assignments, vehicles.
-- Hard deletes are replaced with UPDATE SET deleted_at in edge function handlers.

ALTER TABLE public.damage_reports
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.bids
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.job_assignments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
