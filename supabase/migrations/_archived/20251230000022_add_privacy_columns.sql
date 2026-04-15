-- Pass 834 — Add privacy columns to notification_preferences
-- Two toggles: share_data_with_shops (default true for customers) and show_profile_to_insurers.

ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS share_data_with_shops BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_profile_to_insurers BOOLEAN NOT NULL DEFAULT FALSE;
