-- Create storage buckets for Bidondent application
-- This migration creates three buckets: profiles, vehicles, and damage photos

-- Create profiles bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bidondent-profiles', 'bidondent-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create vehicles bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bidondent-vehicles', 'bidondent-vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- Create damage photos bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bidondent-damage-photos', 'bidondent-damage-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for profiles bucket
-- Allow authenticated users to upload their own files
CREATE POLICY "Allow authenticated uploads to profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bidondent-profiles');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates to profiles"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bidondent-profiles');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from profiles"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bidondent-profiles');

-- Allow public read access to all profile images
CREATE POLICY "Allow public read access to profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bidondent-profiles');

-- Set up storage policies for vehicles bucket
-- Allow authenticated users to upload their own files
CREATE POLICY "Allow authenticated uploads to vehicles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bidondent-vehicles');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates to vehicles"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bidondent-vehicles');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from vehicles"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bidondent-vehicles');

-- Allow public read access to all vehicle images
CREATE POLICY "Allow public read access to vehicles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bidondent-vehicles');

-- Set up storage policies for damage photos bucket
-- Allow authenticated users to upload their own files
CREATE POLICY "Allow authenticated uploads to damage photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bidondent-damage-photos');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates to damage photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bidondent-damage-photos');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from damage photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bidondent-damage-photos');

-- Allow public read access to all damage photos
CREATE POLICY "Allow public read access to damage photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bidondent-damage-photos');
