-- Pass 820 — Enable PostGIS and add geography columns
-- Adds spatial capabilities for server-side geographic queries.
-- Keeps existing DOUBLE PRECISION lat/lng for backward compatibility.
-- Adds GEOGRAPHY(POINT) columns + GIST indexes for efficient proximity queries.

-- 1. Enable PostGIS extension (available on all Supabase plans)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add geography columns (additive — existing columns preserved)

-- damage_reports: where the damage happened
ALTER TABLE public.damage_reports
  ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- shop_profiles: where the shop is located
ALTER TABLE public.shop_profiles
  ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- shop_service_areas: center of radius-based service areas
ALTER TABLE public.shop_service_areas
  ADD COLUMN IF NOT EXISTS center_location GEOGRAPHY(POINT, 4326);

-- 3. Backfill geography from existing lat/lng coordinates

UPDATE public.damage_reports
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL;

UPDATE public.shop_profiles
SET location = ST_SetSRID(ST_MakePoint(geo_longitude, geo_latitude), 4326)::GEOGRAPHY
WHERE geo_latitude IS NOT NULL
  AND geo_longitude IS NOT NULL
  AND location IS NULL;

UPDATE public.shop_service_areas
SET center_location = ST_SetSRID(ST_MakePoint(center_longitude, center_latitude), 4326)::GEOGRAPHY
WHERE center_latitude IS NOT NULL
  AND center_longitude IS NOT NULL
  AND center_location IS NULL;

-- 4. Create GIST spatial indexes for efficient proximity queries

CREATE INDEX IF NOT EXISTS idx_damage_reports_location_gist
  ON public.damage_reports USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_shop_profiles_location_gist
  ON public.shop_profiles USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_shop_service_areas_center_gist
  ON public.shop_service_areas USING GIST(center_location);

-- 5. Trigger functions to keep geography columns in sync on INSERT/UPDATE

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

-- Attach sync triggers (fire BEFORE INSERT OR UPDATE so geography stays current)

CREATE TRIGGER sync_damage_report_location_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON public.damage_reports
  FOR EACH ROW EXECUTE FUNCTION sync_damage_report_location();

CREATE TRIGGER sync_shop_profile_location_trigger
  BEFORE INSERT OR UPDATE OF geo_latitude, geo_longitude
  ON public.shop_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_shop_profile_location();

CREATE TRIGGER sync_service_area_center_location_trigger
  BEFORE INSERT OR UPDATE OF center_latitude, center_longitude
  ON public.shop_service_areas
  FOR EACH ROW EXECUTE FUNCTION sync_service_area_center_location();

-- 6. Convenience function: find shops within radius of a point
-- Returns shop_profile_ids within `radius_meters` of a given point.
-- Usage: SELECT * FROM find_shops_near(lng, lat, radius_meters);

CREATE OR REPLACE FUNCTION find_shops_near(
  p_longitude DOUBLE PRECISION,
  p_latitude DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION DEFAULT 40234  -- ~25 miles
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

-- 7. Convenience function: find reports within a shop's service area
-- Returns report IDs within any of the shop's active radius-type service areas.

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
      sa.radius_miles * 1609.344  -- convert miles to meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;
