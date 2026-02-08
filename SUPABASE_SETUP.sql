-- ============================================================================
-- BIDONDENT SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This SQL script creates all necessary tables and storage buckets for Bidondent
-- 
-- HOW TO USE:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- ============================================================================

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) EXTENSIONS
-- ============================================================================
-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- PROFILES TABLE
-- Stores user profile information for all account types
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('customer', 'shop', 'insurer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VEHICLES TABLE
-- Stores customer vehicle information
CREATE TABLE IF NOT EXISTS public.vehicles (
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

-- DAMAGE REPORTS TABLE
-- Stores damage reports submitted by customers
CREATE TABLE IF NOT EXISTS public.damage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  insurance_claim BOOLEAN DEFAULT false,
  insurance_company TEXT,
  preferred_contact TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for faster profile lookups by email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Index for faster vehicle lookups by user
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);

-- Index for faster damage report lookups
CREATE INDEX IF NOT EXISTS idx_damage_reports_user_id ON public.damage_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_status ON public.damage_reports(status);
CREATE INDEX IF NOT EXISTS idx_damage_reports_created_at ON public.damage_reports(created_at DESC);

-- ============================================================================
-- CREATE UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to vehicles table
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to damage_reports table
DROP TRIGGER IF EXISTS update_damage_reports_updated_at ON public.damage_reports;
CREATE TRIGGER update_damage_reports_updated_at
  BEFORE UPDATE ON public.damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- VEHICLES POLICIES
-- Users can view their own vehicles
DROP POLICY IF EXISTS "Users can view own vehicles" ON public.vehicles;
CREATE POLICY "Users can view own vehicles"
  ON public.vehicles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own vehicles
DROP POLICY IF EXISTS "Users can insert own vehicles" ON public.vehicles;
CREATE POLICY "Users can insert own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own vehicles
DROP POLICY IF EXISTS "Users can update own vehicles" ON public.vehicles;
CREATE POLICY "Users can update own vehicles"
  ON public.vehicles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own vehicles
DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.vehicles;
CREATE POLICY "Users can delete own vehicles"
  ON public.vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- DAMAGE REPORTS POLICIES
-- Users can view their own damage reports
DROP POLICY IF EXISTS "Users can view own damage reports" ON public.damage_reports;
CREATE POLICY "Users can view own damage reports"
  ON public.damage_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own damage reports
DROP POLICY IF EXISTS "Users can insert own damage reports" ON public.damage_reports;
CREATE POLICY "Users can insert own damage reports"
  ON public.damage_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own damage reports
DROP POLICY IF EXISTS "Users can update own damage reports" ON public.damage_reports;
CREATE POLICY "Users can update own damage reports"
  ON public.damage_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own damage reports
DROP POLICY IF EXISTS "Users can delete own damage reports" ON public.damage_reports;
CREATE POLICY "Users can delete own damage reports"
  ON public.damage_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STORAGE BUCKETS (Run this separately if it fails)
-- ============================================================================
-- Note: If storage bucket creation fails, you may need to create them manually
-- in the Supabase Storage section of your dashboard

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('bidondent-profiles', 'bidondent-profiles', true),
  ('bidondent-vehicles', 'bidondent-vehicles', true),
  ('bidondent-damage-photos', 'bidondent-damage-photos', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES FOR PROFILES BUCKET
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
CREATE POLICY "Users can upload own profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bidondent-profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
CREATE POLICY "Users can update own profile images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'bidondent-profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
CREATE POLICY "Users can delete own profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'bidondent-profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;
CREATE POLICY "Profile images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bidondent-profiles');

-- STORAGE POLICIES FOR VEHICLES BUCKET
DROP POLICY IF EXISTS "Users can upload own vehicle images" ON storage.objects;
CREATE POLICY "Users can upload own vehicle images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bidondent-vehicles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own vehicle images" ON storage.objects;
CREATE POLICY "Users can update own vehicle images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'bidondent-vehicles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own vehicle images" ON storage.objects;
CREATE POLICY "Users can delete own vehicle images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'bidondent-vehicles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Vehicle images are publicly accessible" ON storage.objects;
CREATE POLICY "Vehicle images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bidondent-vehicles');

-- STORAGE POLICIES FOR DAMAGE PHOTOS BUCKET
DROP POLICY IF EXISTS "Users can upload own damage photos" ON storage.objects;
CREATE POLICY "Users can upload own damage photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bidondent-damage-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own damage photos" ON storage.objects;
CREATE POLICY "Users can update own damage photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'bidondent-damage-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own damage photos" ON storage.objects;
CREATE POLICY "Users can delete own damage photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'bidondent-damage-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Damage photos are publicly accessible" ON storage.objects;
CREATE POLICY "Damage photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bidondent-damage-photos');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after setup to verify everything was created correctly

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'vehicles', 'damage_reports');

-- Check if storage buckets exist
SELECT * FROM storage.buckets 
WHERE id IN ('bidondent-profiles', 'bidondent-vehicles', 'bidondent-damage-photos');

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your Bidondent database is now ready to use.
-- 
-- NEXT STEPS:
-- 1. Verify that all tables were created by running the verification queries above
-- 2. If storage buckets failed to create, create them manually in Storage section:
--    - bidondent-profiles (public)
--    - bidondent-vehicles (public)
--    - bidondent-damage-photos (public)
-- 3. Test your application by signing up and creating a profile
-- ============================================================================
