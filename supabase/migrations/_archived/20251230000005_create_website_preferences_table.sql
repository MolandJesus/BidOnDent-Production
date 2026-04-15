-- Create website_preferences table for provider-agnostic app-level memory
CREATE TABLE IF NOT EXISTS public.website_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_user_key TEXT UNIQUE NOT NULL,
  provider TEXT,
  provider_user_id TEXT,
  clerk_user_id TEXT,
  normalized_email TEXT,
  display_name TEXT,
  account_type TEXT CHECK (account_type IN ('customer', 'shop', 'insurer')),
  session_memory JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_preferences_user_key
  ON public.website_preferences(website_user_key);

CREATE INDEX IF NOT EXISTS idx_website_preferences_provider_user_id
  ON public.website_preferences(provider_user_id);

CREATE INDEX IF NOT EXISTS idx_website_preferences_clerk_user_id
  ON public.website_preferences(clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_website_preferences_normalized_email
  ON public.website_preferences(normalized_email);

ALTER TABLE public.website_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages website preferences" ON public.website_preferences;
CREATE POLICY "Service role manages website preferences"
  ON public.website_preferences
  USING (false)
  WITH CHECK (false);

DROP TRIGGER IF EXISTS set_updated_at ON public.website_preferences;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.website_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
