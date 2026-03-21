-- ============================================================================
-- BIDONDENT SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This schema defines all tables needed for cloud-based data storage
-- Run this in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores user profile information (name, phone, profile image, etc.)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  account_type TEXT CHECK (account_type IN ('customer', 'shop', 'insurer')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read/write their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VEHICLES TABLE
-- ============================================================================
-- Stores user vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT,
  vin TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only manage their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- DAMAGE REPORTS TABLE
-- ============================================================================
-- Stores damage reports submitted by customers
CREATE TABLE IF NOT EXISTS damage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,

  -- Step 1: Basic Info
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,

  -- Step 2: Damage Details
  damage_type TEXT NOT NULL,
  damage_severity TEXT NOT NULL,
  damage_description TEXT,

  -- Step 3: Location
  damage_location TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,

  -- Step 4: Photos (stored as array of Supabase Storage URLs)
  photo_urls TEXT[] DEFAULT '{}',

  -- Step 5: Additional Info
  insurance_claim BOOLEAN DEFAULT false,
  insurance_company TEXT,
  preferred_contact TEXT,
  additional_notes TEXT,

  -- Metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'accepted', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only manage their own reports
CREATE POLICY "Users can view own damage reports"
  ON damage_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own damage reports"
  ON damage_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own damage reports"
  ON damage_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own damage reports"
  ON damage_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Shops can view all reports (for bidding)
CREATE POLICY "Shops can view all damage reports"
  ON damage_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.account_type = 'shop'
    )
  );

-- ============================================================================
-- BIDS TABLE
-- ============================================================================
-- Stores bids from shops on damage reports
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  damage_report_id UUID REFERENCES damage_reports(id) ON DELETE CASCADE NOT NULL,
  shop_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Bid details
  bid_amount DECIMAL(10, 2) NOT NULL,
  estimated_days INTEGER,
  warranty_months INTEGER,
  message TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Shops can view their own bids"
  ON bids FOR SELECT
  USING (auth.uid() = shop_user_id);

CREATE POLICY "Shops can insert their own bids"
  ON bids FOR INSERT
  WITH CHECK (auth.uid() = shop_user_id);

CREATE POLICY "Customers can view bids on their reports"
  ON bids FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM damage_reports
      WHERE damage_reports.id = bids.damage_report_id
      AND damage_reports.user_id = auth.uid()
    )
  );

-- ============================================================================
-- BUSINESS INTAKE TABLES
-- ============================================================================
-- Stores inbound partnership/shop requests submitted from the landing page
CREATE TABLE IF NOT EXISTS shop_interest_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurer_interest_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  source TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public map-facing partner shops table
CREATE TABLE IF NOT EXISTS public_partner_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC(2,1) DEFAULT 4.5,
  phone_number TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE shop_interest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurer_interest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_partner_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public shop submissions"
  ON shop_interest_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insurer submissions"
  ON insurer_interest_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public event inserts"
  ON platform_activity_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read partner shops"
  ON public_partner_shops FOR SELECT
  USING (true);

-- ============================================================================
-- JOB ASSIGNMENTS TABLE
-- ============================================================================
-- Tracks awarded repairs from bid selection through completion
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  damage_report_id UUID REFERENCES damage_reports(id) ON DELETE CASCADE NOT NULL,
  customer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insurer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'awaiting_parts', 'completed', 'cancelled')),
  scheduled_start_at TIMESTAMP WITH TIME ZONE,
  estimated_completion_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own assignments"
  ON job_assignments FOR SELECT
  USING (auth.uid() = customer_user_id);

CREATE POLICY "Shops can view own assignments"
  ON job_assignments FOR SELECT
  USING (auth.uid() = shop_user_id);

CREATE POLICY "Insurers can view linked assignments"
  ON job_assignments FOR SELECT
  USING (auth.uid() = insurer_user_id);

CREATE POLICY "Shops can update own assignments"
  ON job_assignments FOR UPDATE
  USING (auth.uid() = shop_user_id);

CREATE POLICY "Insurers can update linked assignments"
  ON job_assignments FOR UPDATE
  USING (auth.uid() = insurer_user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_user_id ON damage_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_status ON damage_reports(status);
CREATE INDEX IF NOT EXISTS idx_bids_damage_report_id ON bids(damage_report_id);
CREATE INDEX IF NOT EXISTS idx_bids_shop_user_id ON bids(shop_user_id);
CREATE INDEX IF NOT EXISTS idx_shop_interest_submissions_status ON shop_interest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_shop_interest_submissions_created_at ON shop_interest_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insurer_interest_submissions_status ON insurer_interest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_insurer_interest_submissions_created_at ON insurer_interest_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_activity_events_type ON platform_activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_platform_activity_events_created_at ON platform_activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_partner_shops_active ON public_partner_shops(is_active);
CREATE INDEX IF NOT EXISTS idx_public_partner_shops_zip_code ON public_partner_shops(zip_code);
CREATE INDEX IF NOT EXISTS idx_job_assignments_customer_user_id ON job_assignments(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_shop_user_id ON job_assignments(shop_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_insurer_user_id ON job_assignments(insurer_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_status ON job_assignments(status);
CREATE INDEX IF NOT EXISTS idx_job_assignments_damage_report_id ON job_assignments(damage_report_id);

INSERT INTO public_partner_shops (
  shop_name,
  city,
  state,
  zip_code,
  latitude,
  longitude,
  specialties,
  rating,
  email,
  is_active
)
SELECT
  'BidOnDent Westchester Hub',
  'White Plains',
  'NY',
  '10601',
  41.033,
  -73.7629,
  ARRAY['Collision Repair', 'Insurance Claims'],
  4.8,
  'bidondent@gmail.com',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public_partner_shops WHERE shop_name = 'BidOnDent Westchester Hub'
);

INSERT INTO public_partner_shops (
  shop_name,
  city,
  state,
  zip_code,
  latitude,
  longitude,
  specialties,
  rating,
  email,
  is_active
)
SELECT
  'BidOnDent Rockland Hub',
  'New City',
  'NY',
  '10956',
  41.1432,
  -73.9896,
  ARRAY['Paint & Body', 'Claim Workflow'],
  4.7,
  'bidondent@gmail.com',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public_partner_shops WHERE shop_name = 'BidOnDent Rockland Hub'
);

INSERT INTO public_partner_shops (
  shop_name,
  city,
  state,
  zip_code,
  latitude,
  longitude,
  specialties,
  rating,
  email,
  is_active
)
SELECT
  'BidOnDent Dutchess Hub',
  'Poughkeepsie',
  'NY',
  '12601',
  41.7004,
  -73.921,
  ARRAY['Damage Assessment', 'Partner Dispatch'],
  4.6,
  'bidondent@gmail.com',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public_partner_shops WHERE shop_name = 'BidOnDent Dutchess Hub'
);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_damage_reports_updated_at
  BEFORE UPDATE ON damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_interest_submissions_updated_at
  BEFORE UPDATE ON shop_interest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurer_interest_submissions_updated_at
  BEFORE UPDATE ON insurer_interest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_assignments_updated_at
  BEFORE UPDATE ON job_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Create storage buckets for photos (run this in Supabase Dashboard or via client)
-- 1. Profile images bucket: bidondent-profiles
-- 2. Vehicle images bucket: bidondent-vehicles
-- 3. Damage report photos bucket: bidondent-damage-photos

-- Note: Configure these buckets with appropriate policies in the Supabase Dashboard
