-- =====================================================================
-- Storage pointer backfill
-- =====================================================================
-- Converts persisted Supabase Storage signed URLs (which expire after
-- 24h) into durable storage://<bucket>/<path> pointers. Read paths
-- (hydrateReport / hydrateSignedStorageUrls) re-sign these pointers on
-- demand, so images keep working indefinitely.
--
-- Idempotent: rows already in pointer form are left untouched. Rows
-- with public URLs, data: URIs, NULL, or unrecognized formats are
-- preserved as-is.
--
-- Affected columns:
--   - public.damage_reports.photo_urls          (text[])
--   - public.profiles.profile_image_url         (text)   [defensive]
--   - public.shop_profiles.profile_image_url    (text)   [defensive]
--   - public.insurer_profiles.profile_image_url (text)   [defensive]
--   - public.vehicles.image_url                 (text)   [defensive]
-- =====================================================================

BEGIN;

-- Convert a single Supabase Storage URL to a storage:// pointer.
-- Leaves any URL that is not a /storage/v1/object/{public,sign,authenticated}/
-- match unchanged (idempotent for pointers, public URLs, data: URIs, nulls).
CREATE OR REPLACE FUNCTION pg_temp.to_storage_pointer(raw text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  marker text;
  marker_idx int;
  remainder text;
  query_idx int;
  bucket text;
  path text;
BEGIN
  IF raw IS NULL OR raw = '' THEN
    RETURN raw;
  END IF;

  -- Already a pointer or non-http payload — leave alone.
  IF raw LIKE 'storage://%' OR raw LIKE 'data:%' THEN
    RETURN raw;
  END IF;

  -- Find the first /storage/v1/object/{public,sign,authenticated}/ marker.
  FOR marker IN
    SELECT unnest(ARRAY[
      '/storage/v1/object/sign/',
      '/storage/v1/object/public/',
      '/storage/v1/object/authenticated/'
    ])
  LOOP
    marker_idx := position(marker IN raw);
    IF marker_idx > 0 THEN
      remainder := substring(raw FROM marker_idx + length(marker));

      -- Strip query string (?token=...).
      query_idx := position('?' IN remainder);
      IF query_idx > 0 THEN
        remainder := substring(remainder FROM 1 FOR query_idx - 1);
      END IF;

      -- Split into bucket / path on the first '/'.
      IF position('/' IN remainder) = 0 THEN
        RETURN raw;
      END IF;

      bucket := split_part(remainder, '/', 1);
      path := substring(remainder FROM length(bucket) + 2);

      IF bucket = '' OR path = '' THEN
        RETURN raw;
      END IF;

      RETURN 'storage://' || bucket || '/' || path;
    END IF;
  END LOOP;

  -- Not a recognized storage URL — preserve as-is.
  RETURN raw;
END;
$$;

-- ── Snapshot before change (for audit). ────────────────────────────────
DO $$
DECLARE
  damage_reports_signed int;
  damage_reports_total int;
BEGIN
  SELECT
    count(*) FILTER (WHERE photo_urls::text LIKE '%/object/sign/%'),
    count(*) FILTER (WHERE photo_urls IS NOT NULL AND array_length(photo_urls, 1) > 0)
  INTO damage_reports_signed, damage_reports_total
  FROM public.damage_reports;

  RAISE NOTICE
    'storage pointer backfill (before): damage_reports rows with signed urls = %, rows with any photo = %',
    damage_reports_signed, damage_reports_total;
END $$;

-- ── damage_reports.photo_urls (text[]). ────────────────────────────────
UPDATE public.damage_reports
SET photo_urls = (
  SELECT ARRAY(
    SELECT pg_temp.to_storage_pointer(elem)
    FROM unnest(photo_urls) AS elem
  )
)
WHERE photo_urls IS NOT NULL
  AND array_length(photo_urls, 1) > 0
  AND EXISTS (
    SELECT 1
    FROM unnest(photo_urls) AS elem
    WHERE elem LIKE '%/storage/v1/object/sign/%'
       OR elem LIKE '%/storage/v1/object/public/%'
       OR elem LIKE '%/storage/v1/object/authenticated/%'
  );

-- ── Single-text columns (defensive — currently empty in prod). ─────────
UPDATE public.profiles
SET profile_image_url = pg_temp.to_storage_pointer(profile_image_url)
WHERE profile_image_url IS NOT NULL
  AND (
    profile_image_url LIKE '%/storage/v1/object/sign/%'
    OR profile_image_url LIKE '%/storage/v1/object/public/%'
    OR profile_image_url LIKE '%/storage/v1/object/authenticated/%'
  );

UPDATE public.shop_profiles
SET profile_image_url = pg_temp.to_storage_pointer(profile_image_url)
WHERE profile_image_url IS NOT NULL
  AND (
    profile_image_url LIKE '%/storage/v1/object/sign/%'
    OR profile_image_url LIKE '%/storage/v1/object/public/%'
    OR profile_image_url LIKE '%/storage/v1/object/authenticated/%'
  );

UPDATE public.insurer_profiles
SET profile_image_url = pg_temp.to_storage_pointer(profile_image_url)
WHERE profile_image_url IS NOT NULL
  AND (
    profile_image_url LIKE '%/storage/v1/object/sign/%'
    OR profile_image_url LIKE '%/storage/v1/object/public/%'
    OR profile_image_url LIKE '%/storage/v1/object/authenticated/%'
  );

UPDATE public.vehicles
SET image_url = pg_temp.to_storage_pointer(image_url)
WHERE image_url IS NOT NULL
  AND (
    image_url LIKE '%/storage/v1/object/sign/%'
    OR image_url LIKE '%/storage/v1/object/public/%'
    OR image_url LIKE '%/storage/v1/object/authenticated/%'
  );

-- ── Snapshot after change. ─────────────────────────────────────────────
DO $$
DECLARE
  damage_reports_signed int;
  damage_reports_pointers int;
BEGIN
  SELECT
    count(*) FILTER (WHERE photo_urls::text LIKE '%/object/sign/%'),
    count(*) FILTER (WHERE photo_urls::text LIKE '%storage://%')
  INTO damage_reports_signed, damage_reports_pointers
  FROM public.damage_reports;

  RAISE NOTICE
    'storage pointer backfill (after): damage_reports rows with signed urls = %, rows with pointers = %',
    damage_reports_signed, damage_reports_pointers;

  IF damage_reports_signed > 0 THEN
    RAISE EXCEPTION 'Backfill incomplete: % rows still have signed URLs', damage_reports_signed;
  END IF;
END $$;

COMMIT;
