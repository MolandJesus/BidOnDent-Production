-- Pass 824 — Notification preferences table
-- Per-user notification settings: email, in-app, SMS toggles per event category.
-- Allows users to control which notifications they receive and how.

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,

  -- In-app notification toggles
  in_app_bid_updates BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_report_updates BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_nearby_reports BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_estimate_updates BOOLEAN NOT NULL DEFAULT TRUE,

  -- Email notification toggles
  email_bid_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_report_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_nearby_reports BOOLEAN NOT NULL DEFAULT TRUE,
  email_estimate_updates BOOLEAN NOT NULL DEFAULT TRUE,

  -- Future: SMS toggles (disabled by default)
  sms_bid_updates BOOLEAN NOT NULL DEFAULT FALSE,
  sms_report_updates BOOLEAN NOT NULL DEFAULT FALSE,

  -- Global toggles
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by clerk user
CREATE INDEX IF NOT EXISTS idx_notification_prefs_clerk_user
  ON public.notification_preferences(clerk_user_id);

-- Updated-at trigger
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: users can only read/write their own preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences
  FOR ALL
  USING (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );
