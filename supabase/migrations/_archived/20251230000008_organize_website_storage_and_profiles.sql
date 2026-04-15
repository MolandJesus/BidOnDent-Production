ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT,
  ADD COLUMN IF NOT EXISTS website_user_key TEXT;

ALTER TABLE public.profiles
  ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_clerk_user_id
  ON public.profiles(clerk_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_website_user_key
  ON public.profiles(website_user_key);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'bidondent-account-media',
    'bidondent-account-media',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'bidondent-vehicle-media',
    'bidondent-vehicle-media',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'bidondent-report-media',
    'bidondent-report-media',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO NOTHING;

DELETE FROM storage.objects
WHERE bucket_id = 'bidondent-landing-page-images';

DELETE FROM storage.buckets
WHERE id = 'bidondent-landing-page-images';
