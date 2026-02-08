-- ============================================================================
-- BIDONDENT DATABASE SCHEMA
-- Migration: 001_initial_schema
-- Description: Complete database schema for Bidondent platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- Stores user profile information
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('customer', 'shop', 'insurer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- VEHICLES TABLE
-- Stores customer vehicle information
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);

-- ============================================================================
-- DAMAGE REPORTS TABLE
-- Stores customer damage reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS damage_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  -- Vehicle info (denormalized for reports without vehicle_id)
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  
  -- Damage details
  damage_type TEXT NOT NULL,
  damage_severity TEXT NOT NULL,
  damage_description TEXT,
  damage_location TEXT NOT NULL,
  
  -- Location info
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Media
  photo_urls TEXT[] DEFAULT '{}',
  
  -- Insurance info
  insurance_claim BOOLEAN DEFAULT FALSE,
  insurance_company TEXT,
  
  -- Contact preferences
  preferred_contact TEXT,
  additional_notes TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'accepted', 'completed', 'cancelled')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_damage_reports_user_id ON damage_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_vehicle_id ON damage_reports(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_status ON damage_reports(status);
CREATE INDEX IF NOT EXISTS idx_damage_reports_created_at ON damage_reports(created_at DESC);

-- ============================================================================
-- BIDS TABLE
-- Stores shop bids on damage reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  damage_report_id UUID REFERENCES damage_reports(id) ON DELETE CASCADE NOT NULL,
  shop_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Bid details
  amount DECIMAL(10, 2) NOT NULL,
  estimated_days INTEGER NOT NULL,
  description TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bids_damage_report_id ON bids(damage_report_id);
CREATE INDEX IF NOT EXISTS idx_bids_shop_user_id ON bids(shop_user_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- ============================================================================
-- SHOP PROFILES TABLE
-- Extended information for shop accounts
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Business info
  business_name TEXT NOT NULL,
  business_address TEXT,
  business_city TEXT,
  business_state TEXT,
  business_zip TEXT,
  business_phone TEXT,
  
  -- Certifications & specialties
  certifications TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  
  -- Ratings
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  
  -- Availability
  is_accepting_bids BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_profiles_user_id ON shop_profiles(user_id);

-- ============================================================================
-- INSURER PROFILES TABLE
-- Extended information for insurance company accounts
-- ============================================================================

CREATE TABLE IF NOT EXISTS insurer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Company info
  company_name TEXT NOT NULL,
  company_address TEXT,
  company_city TEXT,
  company_state TEXT,
  company_zip TEXT,
  company_phone TEXT,
  
  -- License info
  license_number TEXT,
  license_state TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurer_profiles_user_id ON insurer_profiles(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurer_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all profiles (for admin dashboard)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND email = 'molalign5@gmail.com'
    )
  );

-- ============================================================================
-- VEHICLES POLICIES
-- ============================================================================

-- Users can view their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own vehicles
CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own vehicles
CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own vehicles
CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- DAMAGE REPORTS POLICIES
-- ============================================================================

-- Customers can view their own reports
CREATE POLICY "Customers can view own reports"
  ON damage_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Shops can view all reports (to bid on them)
CREATE POLICY "Shops can view all reports"
  ON damage_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND account_type = 'shop'
    )
  );

-- Insurers can view all reports
CREATE POLICY "Insurers can view all reports"
  ON damage_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND account_type = 'insurer'
    )
  );

-- Customers can insert their own reports
CREATE POLICY "Customers can insert own reports"
  ON damage_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Customers can update their own reports
CREATE POLICY "Customers can update own reports"
  ON damage_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Customers can delete their own reports
CREATE POLICY "Customers can delete own reports"
  ON damage_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- BIDS POLICIES
-- ============================================================================

-- Shops can view their own bids
CREATE POLICY "Shops can view own bids"
  ON bids FOR SELECT
  USING (auth.uid() = shop_user_id);

-- Report owners can view bids on their reports
CREATE POLICY "Report owners can view bids"
  ON bids FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM damage_reports
      WHERE damage_reports.id = bids.damage_report_id
      AND damage_reports.user_id = auth.uid()
    )
  );

-- Shops can insert bids
CREATE POLICY "Shops can insert bids"
  ON bids FOR INSERT
  WITH CHECK (
    auth.uid() = shop_user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND account_type = 'shop'
    )
  );

-- Shops can update their own bids
CREATE POLICY "Shops can update own bids"
  ON bids FOR UPDATE
  USING (auth.uid() = shop_user_id);

-- Shops can delete their own bids
CREATE POLICY "Shops can delete own bids"
  ON bids FOR DELETE
  USING (auth.uid() = shop_user_id);

-- ============================================================================
-- SHOP PROFILES POLICIES
-- ============================================================================

-- Shop users can view their own profile
CREATE POLICY "Shop users can view own profile"
  ON shop_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- All authenticated users can view shop profiles
CREATE POLICY "All users can view shop profiles"
  ON shop_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Shop users can insert their own profile
CREATE POLICY "Shop users can insert own profile"
  ON shop_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Shop users can update their own profile
CREATE POLICY "Shop users can update own profile"
  ON shop_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INSURER PROFILES POLICIES
-- ============================================================================

-- Insurer users can view their own profile
CREATE POLICY "Insurer users can view own profile"
  ON insurer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- All authenticated users can view insurer profiles
CREATE POLICY "All users can view insurer profiles"
  ON insurer_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insurer users can insert their own profile
CREATE POLICY "Insurer users can insert own profile"
  ON insurer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insurer users can update their own profile
CREATE POLICY "Insurer users can update own profile"
  ON insurer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- Automatically update the updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_damage_reports_updated_at BEFORE UPDATE ON damage_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_profiles_updated_at BEFORE UPDATE ON shop_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurer_profiles_updated_at BEFORE UPDATE ON insurer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKETS SETUP
-- Note: These need to be created via Supabase Dashboard or Edge Function
-- ============================================================================

-- Buckets to create:
-- 1. bidondent-profiles (for profile images)
-- 2. bidondent-vehicles (for vehicle images)
-- 3. bidondent-damage-photos (for damage report photos)

-- Storage policies will be set up in the dashboard with:
-- - Private buckets (require authentication)
-- - Users can upload to their own folders (user_id)
-- - Public read access via signed URLs
