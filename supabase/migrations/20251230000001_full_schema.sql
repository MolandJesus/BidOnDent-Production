-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 2. UTILITY FUNCTIONS
-- ============================================================================

-- updated_at trigger function (used by newer migrations)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at trigger function (used by older migrations — same logic, kept for compat)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Clerk JWT identity helper — extracts clerk user ID from request.jwt.claims
CREATE OR REPLACE FUNCTION public.requesting_clerk_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '');
$$;

-- ============================================================================
-- 3. TABLES (dependency order)
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.1 profiles
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('customer', 'shop', 'insurer')),
  clerk_user_id TEXT,
  website_user_key TEXT,
  setup_completed BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE UNIQUE INDEX idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
CREATE UNIQUE INDEX idx_profiles_website_user_key ON public.profiles(website_user_key);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.2 vehicles
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT,
  vin TEXT,
  image_url TEXT,
  clerk_user_id TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT vehicles_user_id_or_clerk_user_id
    CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL)
);

CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX idx_vehicles_clerk_user_id ON public.vehicles(clerk_user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.3 damage_reports
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  damage_type TEXT NOT NULL,
  damage_severity TEXT NOT NULL,
  damage_description TEXT,
  damage_location TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  insurance_claim BOOLEAN DEFAULT FALSE,
  insurance_company TEXT,
  preferred_contact TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'quoted', 'accepted', 'completed', 'cancelled')),
  clerk_user_id TEXT,
  -- Claim decision fields (migration 015)
  claim_status TEXT DEFAULT NULL,
  approved_amount NUMERIC DEFAULT NULL,
  denial_reason TEXT DEFAULT NULL,
  claim_decision_date TIMESTAMPTZ DEFAULT NULL,
  claim_decided_by TEXT DEFAULT NULL,
  -- Geocoding (migration 016)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  -- PostGIS geography (migration 018)
  location GEOGRAPHY(POINT, 4326),
  -- Insurance shop assignment (migration 020)
  assigned_shop_clerk_user_id TEXT DEFAULT NULL,
  -- Soft delete (migration 027)
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_id_or_clerk_user_id
    CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL)
);

CREATE INDEX idx_damage_reports_user_id ON public.damage_reports(user_id);
CREATE INDEX idx_damage_reports_vehicle_id ON public.damage_reports(vehicle_id);
CREATE INDEX idx_damage_reports_status ON public.damage_reports(status);
CREATE INDEX idx_damage_reports_created_at ON public.damage_reports(created_at DESC);
CREATE INDEX idx_damage_reports_clerk_user_id ON public.damage_reports(clerk_user_id);
CREATE INDEX idx_damage_reports_claim_status ON public.damage_reports(claim_status) WHERE claim_status IS NOT NULL;
CREATE INDEX idx_damage_reports_coords ON public.damage_reports(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_damage_reports_location_gist ON public.damage_reports USING GIST(location);
CREATE INDEX idx_damage_reports_assigned_shop ON public.damage_reports(assigned_shop_clerk_user_id) WHERE assigned_shop_clerk_user_id IS NOT NULL;

COMMENT ON COLUMN public.damage_reports.claim_status IS 'Claim decision: pending, approved, denied';
COMMENT ON COLUMN public.damage_reports.approved_amount IS 'Dollar amount approved by insurer';
COMMENT ON COLUMN public.damage_reports.denial_reason IS 'Reason for claim denial';
COMMENT ON COLUMN public.damage_reports.claim_decision_date IS 'When the claim decision was made';
COMMENT ON COLUMN public.damage_reports.claim_decided_by IS 'Clerk user ID of the insurer who decided';
COMMENT ON COLUMN public.damage_reports.assigned_shop_clerk_user_id IS 'Clerk user ID of the shop assigned to this claim by an insurer';

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.4 bids
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_report_id UUID REFERENCES public.damage_reports(id) ON DELETE CASCADE NOT NULL,
  shop_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  estimated_days INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  clerk_shop_user_id TEXT,
  shop_name TEXT,
  shop_email TEXT,
  notes TEXT,
  shop_rating DECIMAL(3, 2),
  shop_reviews INTEGER,
  shop_distance TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT bids_shop_identity_check
    CHECK (shop_user_id IS NOT NULL OR clerk_shop_user_id IS NOT NULL)
);

CREATE INDEX idx_bids_damage_report_id ON public.bids(damage_report_id);
CREATE INDEX idx_bids_shop_user_id ON public.bids(shop_user_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_bids_clerk_shop_user_id ON public.bids(clerk_shop_user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.5 shop_profiles
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.shop_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_address TEXT,
  business_city TEXT,
  business_state TEXT,
  business_zip TEXT,
  business_phone TEXT,
  certifications TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  is_accepting_bids BOOLEAN DEFAULT TRUE,
  clerk_user_id TEXT,
  website_user_key TEXT,
  website TEXT,
  business_hours TEXT,
  insurer_programs TEXT[] DEFAULT '{}',
  supported_makes TEXT[] DEFAULT '{}',
  average_ticket_value NUMERIC(10, 2),
  response_time_hours INTEGER DEFAULT 3,
  completion_rate INTEGER DEFAULT 95,
  profile_image_url TEXT,
  about_summary TEXT,
  geo_latitude DOUBLE PRECISION,
  geo_longitude DOUBLE PRECISION,
  accepts_insurance_claims BOOLEAN DEFAULT FALSE,
  offers_estimates BOOLEAN DEFAULT FALSE,
  is_directory_visible BOOLEAN DEFAULT TRUE,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shop_profiles_user_id ON public.shop_profiles(user_id);
CREATE UNIQUE INDEX idx_shop_profiles_website_user_key ON public.shop_profiles(website_user_key);
CREATE UNIQUE INDEX idx_shop_profiles_clerk_user_id ON public.shop_profiles(clerk_user_id);
CREATE INDEX idx_shop_profiles_location_gist ON public.shop_profiles USING GIST(location);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.6 insurer_profiles
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.insurer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_address TEXT,
  company_city TEXT,
  company_state TEXT,
  company_zip TEXT,
  company_phone TEXT,
  license_number TEXT,
  license_state TEXT,
  clerk_user_id TEXT,
  website_user_key TEXT,
  website TEXT,
  claim_types TEXT[] DEFAULT '{}',
  preferred_shops BOOLEAN DEFAULT FALSE,
  auto_approval BOOLEAN DEFAULT FALSE,
  max_claim_amount NUMERIC(10, 2),
  description TEXT,
  repair_program_focus TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  account_connection_notes TEXT[] DEFAULT '{}',
  digital_claims_experience TEXT DEFAULT 'standard',
  popular BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT,
  is_directory_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurer_profiles_user_id ON public.insurer_profiles(user_id);
CREATE UNIQUE INDEX idx_insurer_profiles_website_user_key ON public.insurer_profiles(website_user_key);
CREATE UNIQUE INDEX idx_insurer_profiles_clerk_user_id ON public.insurer_profiles(clerk_user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.7 website_preferences
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.website_preferences (
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

CREATE INDEX idx_website_preferences_user_key ON public.website_preferences(website_user_key);
CREATE INDEX idx_website_preferences_provider_user_id ON public.website_preferences(provider_user_id);
CREATE INDEX idx_website_preferences_clerk_user_id ON public.website_preferences(clerk_user_id);
CREATE INDEX idx_website_preferences_normalized_email ON public.website_preferences(normalized_email);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.8 website_relationships
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.website_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_user_key TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('customer', 'shop', 'insurer')),
  relationship_type TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('shop', 'insurer')),
  target_id TEXT NOT NULL,
  target_label TEXT,
  target_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (website_user_key, relationship_type, target_type, target_id)
);

CREATE INDEX idx_website_relationships_user_key ON public.website_relationships(website_user_key);
CREATE INDEX idx_website_relationships_type ON public.website_relationships(relationship_type);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.9 navigation_sessions
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.navigation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  session_data JSONB NOT NULL,
  clerk_user_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

CREATE INDEX idx_navigation_sessions_user_session ON public.navigation_sessions(user_id, session_id);
CREATE INDEX idx_navigation_sessions_clerk_user_id ON public.navigation_sessions(clerk_user_id);
CREATE UNIQUE INDEX idx_navigation_sessions_clerk_user_session ON public.navigation_sessions(clerk_user_id, session_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.10 shop_interest_submissions
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.shop_interest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL,
  dmv_registration_number TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  website TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shop_interest_submissions_status ON public.shop_interest_submissions(status);
CREATE INDEX idx_shop_interest_submissions_created_at ON public.shop_interest_submissions(created_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.11 insurer_interest_submissions
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.insurer_interest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurer_interest_submissions_status ON public.insurer_interest_submissions(status);
CREATE INDEX idx_insurer_interest_submissions_created_at ON public.insurer_interest_submissions(created_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.12 platform_activity_events
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.platform_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  actor_id TEXT,
  object_id TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_activity_events_type ON public.platform_activity_events(event_type);
CREATE INDEX idx_platform_activity_events_created_at ON public.platform_activity_events(created_at DESC);
CREATE INDEX idx_platform_activity_events_actor ON public.platform_activity_events(actor_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.13 public_partner_shops
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.public_partner_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC(3, 2) DEFAULT 4.5,
  phone_number TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_public_partner_shops_active ON public.public_partner_shops(is_active);
CREATE INDEX idx_public_partner_shops_zip_code ON public.public_partner_shops(zip_code);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.14 job_assignments
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_report_id UUID REFERENCES public.damage_reports(id) ON DELETE CASCADE NOT NULL,
  customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  insurer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_clerk_user_id TEXT,
  shop_clerk_user_id TEXT,
  insurer_clerk_user_id TEXT,
  bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'awaiting_parts', 'completed', 'cancelled')),
  scheduled_start_at TIMESTAMPTZ,
  estimated_completion_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_assignments_customer_user_id ON public.job_assignments(customer_user_id);
CREATE INDEX idx_job_assignments_shop_user_id ON public.job_assignments(shop_user_id);
CREATE INDEX idx_job_assignments_insurer_user_id ON public.job_assignments(insurer_user_id);
CREATE INDEX idx_job_assignments_shop_clerk_user_id ON public.job_assignments(shop_clerk_user_id);
CREATE INDEX idx_job_assignments_status ON public.job_assignments(status);
CREATE INDEX idx_job_assignments_damage_report_id ON public.job_assignments(damage_report_id);
CREATE INDEX idx_job_assignments_bid_id ON public.job_assignments(bid_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.15 estimate_requests
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.estimate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_customer_user_id TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  shop_id INTEGER,
  shop_name TEXT,
  description TEXT NOT NULL,
  timeline TEXT DEFAULT 'flexible'
    CHECK (timeline IN ('urgent', 'this-week', 'flexible')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'viewed', 'responded', 'declined', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.16 shop_service_areas
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.shop_service_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_profile_id UUID NOT NULL REFERENCES public.shop_profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Service Area',
  area_type TEXT NOT NULL DEFAULT 'radius'
    CHECK (area_type IN ('radius', 'zip_codes')),
  center_latitude DOUBLE PRECISION,
  center_longitude DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION DEFAULT 15,
  zip_codes TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  center_location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shop_service_areas_shop_profile_id ON public.shop_service_areas(shop_profile_id);
CREATE INDEX idx_shop_service_areas_active ON public.shop_service_areas(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_shop_service_areas_center_gist ON public.shop_service_areas USING GIST(center_location);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3.17 notification_preferences
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  in_app_bid_updates BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_report_updates BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_nearby_reports BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_estimate_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_bid_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_report_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_nearby_reports BOOLEAN NOT NULL DEFAULT TRUE,
  email_estimate_updates BOOLEAN NOT NULL DEFAULT TRUE,
  sms_bid_updates BOOLEAN NOT NULL DEFAULT FALSE,
  sms_report_updates BOOLEAN NOT NULL DEFAULT FALSE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  share_data_with_shops BOOLEAN NOT NULL DEFAULT TRUE,
  show_profile_to_insurers BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_prefs_clerk_user ON public.notification_preferences(clerk_user_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY — Enable on all tables
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_interest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurer_interest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_partner_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES
-- Canonical set from migration 024 (Clerk JWT) + per-table originals
-- ============================================================================

-- ──── profiles ──────────────────────────────────────────────────────────────

CREATE POLICY "Users can read all profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

-- ──── vehicles ──────────────────────────────────────────────────────────────

CREATE POLICY "Users can read their own vehicles"
  ON public.vehicles FOR SELECT
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can insert their own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own vehicles"
  ON public.vehicles FOR UPDATE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own vehicles"
  ON public.vehicles FOR DELETE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

-- ──── damage_reports ────────────────────────────────────────────────────────

CREATE POLICY "Users can read their own damage reports"
  ON public.damage_reports FOR SELECT
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Shops and insurers can read all damage reports"
  ON public.damage_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.clerk_user_id = requesting_clerk_user_id()
      AND profiles.account_type IN ('shop', 'insurer')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.account_type IN ('shop', 'insurer')
    )
  );

CREATE POLICY "Users can insert their own damage reports"
  ON public.damage_reports FOR INSERT
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own damage reports"
  ON public.damage_reports FOR UPDATE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own damage reports"
  ON public.damage_reports FOR DELETE
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR auth.uid() = user_id
  );

-- ──── bids ──────────────────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can read bids"
  ON public.bids FOR SELECT
  USING (
    requesting_clerk_user_id() IS NOT NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated shops can manage bids"
  ON public.bids FOR ALL
  USING (
    clerk_shop_user_id = requesting_clerk_user_id()
    OR auth.uid() = shop_user_id
  )
  WITH CHECK (
    clerk_shop_user_id = requesting_clerk_user_id()
    OR auth.uid() = shop_user_id
  );

-- ──── shop_profiles ─────────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can read shop profiles"
  ON public.shop_profiles FOR SELECT
  USING (requesting_clerk_user_id() IS NOT NULL OR auth.role() = 'authenticated');

CREATE POLICY "Shop owners can manage their own profile"
  ON public.shop_profiles FOR ALL
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR user_id = auth.uid()
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR user_id = auth.uid()
  );

-- ──── insurer_profiles ──────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can read insurer profiles"
  ON public.insurer_profiles FOR SELECT
  USING (requesting_clerk_user_id() IS NOT NULL OR auth.role() = 'authenticated');

CREATE POLICY "Insurer owners can manage their own profile"
  ON public.insurer_profiles FOR ALL
  USING (
    clerk_user_id = requesting_clerk_user_id()
    OR user_id = auth.uid()
  )
  WITH CHECK (
    clerk_user_id = requesting_clerk_user_id()
    OR user_id = auth.uid()
  );

-- ──── website_preferences (service-role only) ───────────────────────────────

CREATE POLICY "Service role manages website preferences"
  ON public.website_preferences
  USING (false)
  WITH CHECK (false);

-- ──── website_relationships (service-role only) ─────────────────────────────

CREATE POLICY "Service role manages website relationships"
  ON public.website_relationships
  USING (false)
  WITH CHECK (false);

-- ──── shop_interest_submissions (public insert with validation) ─────────────

CREATE POLICY "Allow validated shop submissions"
  ON public.shop_interest_submissions
  FOR INSERT
  WITH CHECK (
    length(trim(coalesce(shop_name, ''))) > 0
    AND length(trim(coalesce(email, ''))) > 2
    AND length(trim(coalesce(contact_person, ''))) > 0
  );

-- ──── insurer_interest_submissions (public insert with validation) ──────────

CREATE POLICY "Allow validated insurer submissions"
  ON public.insurer_interest_submissions
  FOR INSERT
  WITH CHECK (
    length(trim(coalesce(company_name, ''))) > 0
    AND length(trim(coalesce(email, ''))) > 2
    AND length(trim(coalesce(contact_person, ''))) > 0
  );

-- ──── platform_activity_events ──────────────────────────────────────────────

CREATE POLICY "Allow validated event inserts"
  ON public.platform_activity_events
  FOR INSERT
  WITH CHECK (
    length(trim(coalesce(event_type, ''))) > 0
  );

CREATE POLICY "Admins can read platform activity events"
  ON public.platform_activity_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.clerk_user_id = requesting_clerk_user_id()
      AND profiles.is_admin = TRUE
    )
  );

-- ──── public_partner_shops (public read) ────────────────────────────────────

CREATE POLICY "Allow public read partner shops"
  ON public.public_partner_shops FOR SELECT
  USING (true);

-- ──── job_assignments ───────────────────────────────────────────────────────

CREATE POLICY "Participants can read their own job assignments"
  ON public.job_assignments FOR SELECT
  USING (
    shop_clerk_user_id = requesting_clerk_user_id()
    OR customer_clerk_user_id = requesting_clerk_user_id()
    OR insurer_clerk_user_id = requesting_clerk_user_id()
    OR customer_user_id = auth.uid()
    OR shop_user_id = auth.uid()
    OR insurer_user_id = auth.uid()
  );

CREATE POLICY "Shops can manage their own job assignments"
  ON public.job_assignments FOR ALL
  USING (
    shop_clerk_user_id = requesting_clerk_user_id()
    OR shop_user_id = auth.uid()
  )
  WITH CHECK (
    shop_clerk_user_id = requesting_clerk_user_id()
    OR shop_user_id = auth.uid()
  );

-- ──── estimate_requests ─────────────────────────────────────────────────────

CREATE POLICY "Customers can read their own estimate requests"
  ON public.estimate_requests FOR SELECT
  USING (clerk_customer_user_id = requesting_clerk_user_id());

CREATE POLICY "Customers can insert their own estimate requests"
  ON public.estimate_requests FOR INSERT
  WITH CHECK (clerk_customer_user_id = requesting_clerk_user_id());

CREATE POLICY "Shops can read estimate requests sent to them"
  ON public.estimate_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.clerk_user_id = requesting_clerk_user_id()
      AND profiles.account_type = 'shop'
    )
  );

-- ──── shop_service_areas ────────────────────────────────────────────────────

CREATE POLICY "Shop owners can manage their own service areas"
  ON public.shop_service_areas
  FOR ALL
  USING (
    shop_profile_id IN (
      SELECT id FROM public.shop_profiles
      WHERE clerk_user_id = requesting_clerk_user_id()
    )
  );

CREATE POLICY "Authenticated users can view active service areas"
  ON public.shop_service_areas
  FOR SELECT
  USING (is_active = TRUE);

-- ──── notification_preferences ──────────────────────────────────────────────

CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences
  FOR ALL
  USING (
    clerk_user_id = requesting_clerk_user_id()
  );

-- ============================================================================
-- 6. TRIGGERS — updated_at
-- ============================================================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_damage_reports_updated_at
  BEFORE UPDATE ON public.damage_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_profiles_updated_at
  BEFORE UPDATE ON public.shop_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurer_profiles_updated_at
  BEFORE UPDATE ON public.insurer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_website_preferences
  BEFORE UPDATE ON public.website_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_website_relationships
  BEFORE UPDATE ON public.website_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_shop_interest_submissions
  BEFORE UPDATE ON public.shop_interest_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_insurer_interest_submissions
  BEFORE UPDATE ON public.insurer_interest_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_public_partner_shops
  BEFORE UPDATE ON public.public_partner_shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_job_assignments
  BEFORE UPDATE ON public.job_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_estimate_requests_updated_at
  BEFORE UPDATE ON public.estimate_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_service_areas_updated_at
  BEFORE UPDATE ON public.shop_service_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. POSTGIS — Geography sync triggers + convenience functions
-- ============================================================================

-- Sync damage_reports.location from lat/lng on insert/update
CREATE OR REPLACE FUNCTION sync_damage_report_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::GEOGRAPHY;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_damage_report_location_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON public.damage_reports
  FOR EACH ROW EXECUTE FUNCTION sync_damage_report_location();

-- Sync shop_profiles.location from geo_latitude/geo_longitude
CREATE OR REPLACE FUNCTION sync_shop_profile_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.geo_latitude IS NOT NULL AND NEW.geo_longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.geo_longitude, NEW.geo_latitude), 4326)::GEOGRAPHY;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_shop_profile_location_trigger
  BEFORE INSERT OR UPDATE OF geo_latitude, geo_longitude
  ON public.shop_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_shop_profile_location();

-- Sync shop_service_areas.center_location from center_latitude/center_longitude
CREATE OR REPLACE FUNCTION sync_service_area_center_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.center_latitude IS NOT NULL AND NEW.center_longitude IS NOT NULL THEN
    NEW.center_location := ST_SetSRID(ST_MakePoint(NEW.center_longitude, NEW.center_latitude), 4326)::GEOGRAPHY;
  ELSE
    NEW.center_location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_service_area_center_location_trigger
  BEFORE INSERT OR UPDATE OF center_latitude, center_longitude
  ON public.shop_service_areas
  FOR EACH ROW EXECUTE FUNCTION sync_service_area_center_location();

-- Find shops within radius of a point (meters). Default ~25 miles.
CREATE OR REPLACE FUNCTION find_shops_near(
  p_longitude DOUBLE PRECISION,
  p_latitude DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION DEFAULT 40234
)
RETURNS TABLE (
  shop_profile_id UUID,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id AS shop_profile_id,
    ST_Distance(
      sp.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::GEOGRAPHY
    ) AS distance_meters
  FROM public.shop_profiles sp
  WHERE sp.location IS NOT NULL
    AND ST_DWithin(
      sp.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::GEOGRAPHY,
      p_radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Find reports within any of a shop's active radius-type service areas.
CREATE OR REPLACE FUNCTION find_reports_in_service_area(
  p_shop_profile_id UUID
)
RETURNS TABLE (
  report_id UUID,
  distance_meters DOUBLE PRECISION,
  service_area_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dr.id AS report_id,
    ST_Distance(dr.location, sa.center_location) AS distance_meters,
    sa.id AS service_area_id
  FROM public.damage_reports dr
  INNER JOIN public.shop_service_areas sa
    ON sa.shop_profile_id = p_shop_profile_id
    AND sa.is_active = TRUE
    AND sa.area_type = 'radius'
    AND sa.center_location IS NOT NULL
  WHERE dr.location IS NOT NULL
    AND ST_DWithin(
      dr.location,
      sa.center_location,
      sa.radius_miles * 1609.344
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 8. IDEMPOTENCY GUARDS (partial unique indexes)
-- ============================================================================

-- One active bid per shop per damage report
CREATE UNIQUE INDEX uq_bids_report_shop
  ON public.bids(damage_report_id, clerk_shop_user_id)
  WHERE status NOT IN ('rejected', 'withdrawn');

-- One active job assignment per damage report
CREATE UNIQUE INDEX uq_job_assignments_report
  ON public.job_assignments(damage_report_id)
  WHERE status NOT IN ('cancelled');

-- ============================================================================
-- 9. STORAGE BUCKETS (all private — access via edge functions + signed URLs)
-- ============================================================================

-- Primary media buckets (with file size / mime type restrictions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'bidondent-account-media',
    'bidondent-account-media',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'bidondent-vehicle-media',
    'bidondent-vehicle-media',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'bidondent-report-media',
    'bidondent-report-media',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Legacy-named buckets (kept for backward compatibility — also private)
-- Uses DO UPDATE to ensure public=false even if the bucket already exists.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('bidondent-profiles', 'bidondent-profiles', false),
  ('bidondent-vehicles', 'bidondent-vehicles', false),
  ('bidondent-damage-photos', 'bidondent-damage-photos', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- No public-read storage policies. All storage access flows through
-- authenticated edge functions using service_role key + signed URLs.

-- ============================================================================
-- 10. ROLE GRANTS
-- Supabase expects anon/authenticated/service_role to have table-level access.
-- RLS policies then filter what each role can actually see/do.
-- These grants are critical after a DROP SCHEMA / CREATE SCHEMA cycle.
-- ============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
