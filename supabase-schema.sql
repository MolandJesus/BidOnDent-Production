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
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_user_id ON damage_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_status ON damage_reports(status);
CREATE INDEX IF NOT EXISTS idx_bids_damage_report_id ON bids(damage_report_id);
CREATE INDEX IF NOT EXISTS idx_bids_shop_user_id ON bids(shop_user_id);

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

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Create storage buckets for photos (run this in Supabase Dashboard or via client)
-- 1. Profile images bucket: bidondent-profiles
-- 2. Vehicle images bucket: bidondent-vehicles  
-- 3. Damage report photos bucket: bidondent-damage-photos

-- Note: Configure these buckets with appropriate policies in the Supabase Dashboard
