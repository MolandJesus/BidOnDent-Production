-- Make shop and insurer profiles provider-agnostic for Clerk-backed website identities.

ALTER TABLE public.shop_profiles
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.shop_profiles
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT,
  ADD COLUMN IF NOT EXISTS website_user_key TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS business_hours TEXT,
  ADD COLUMN IF NOT EXISTS insurer_programs TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS supported_makes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS average_ticket_value NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS completion_rate INTEGER DEFAULT 95,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS about_summary TEXT,
  ADD COLUMN IF NOT EXISTS geo_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS geo_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS accepts_insurance_claims BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS offers_estimates BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_directory_visible BOOLEAN DEFAULT TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_profiles_website_user_key
  ON public.shop_profiles(website_user_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_profiles_clerk_user_id
  ON public.shop_profiles(clerk_user_id);

ALTER TABLE public.insurer_profiles
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.insurer_profiles
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT,
  ADD COLUMN IF NOT EXISTS website_user_key TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS claim_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_shops BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_approval BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_claim_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS repair_program_focus TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS account_connection_notes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS digital_claims_experience TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_directory_visible BOOLEAN DEFAULT TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_insurer_profiles_website_user_key
  ON public.insurer_profiles(website_user_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_insurer_profiles_clerk_user_id
  ON public.insurer_profiles(clerk_user_id);
