-- Make user-uploaded storage buckets private.
-- Access now flows through authenticated edge functions that mint short-lived signed URLs.

UPDATE storage.buckets
SET public = false
WHERE id IN (
  'bidondent-account-media',
  'bidondent-vehicle-media',
  'bidondent-report-media',
  'bidondent-profiles',
  'bidondent-vehicles',
  'bidondent-damage-photos'
);

DROP POLICY IF EXISTS "Allow public read access to profiles" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to damage photos" ON storage.objects;
