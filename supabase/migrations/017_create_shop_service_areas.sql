-- Pass 811 — Create shop_service_areas table
-- Allows shops to define geographic areas they serve.
-- Each shop can have multiple service areas (e.g., multiple radius zones, zip codes).

CREATE TABLE IF NOT EXISTS public.shop_service_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_profile_id UUID NOT NULL REFERENCES public.shop_profiles(id) ON DELETE CASCADE,

  -- Human-readable label (e.g., "Primary zone", "Extended range")
  label TEXT NOT NULL DEFAULT 'Service Area',

  -- Area definition: radius-based (center + miles) or zip-code list
  area_type TEXT NOT NULL DEFAULT 'radius' CHECK (area_type IN ('radius', 'zip_codes')),

  -- For radius type: center coordinates + radius in miles
  center_latitude DOUBLE PRECISION,
  center_longitude DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION DEFAULT 15,

  -- For zip_codes type: array of serviced zip codes
  zip_codes TEXT[] DEFAULT '{}',

  -- Whether this area is active (shops can temporarily disable areas)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by shop
CREATE INDEX IF NOT EXISTS idx_shop_service_areas_shop_profile_id
  ON public.shop_service_areas(shop_profile_id);

-- Index for active areas only (most queries filter on this)
CREATE INDEX IF NOT EXISTS idx_shop_service_areas_active
  ON public.shop_service_areas(is_active) WHERE is_active = TRUE;

-- Updated-at trigger
CREATE TRIGGER update_shop_service_areas_updated_at
  BEFORE UPDATE ON public.shop_service_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: shops can manage their own service areas, all authenticated users can read
ALTER TABLE public.shop_service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage their own service areas"
  ON public.shop_service_areas
  FOR ALL
  USING (
    shop_profile_id IN (
      SELECT id FROM public.shop_profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Authenticated users can view active service areas"
  ON public.shop_service_areas
  FOR SELECT
  USING (is_active = TRUE);
