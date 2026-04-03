-- Add geocoded coordinates to damage_reports for map-native location queries
ALTER TABLE public.damage_reports
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Index for spatial range queries (bounding-box style)
CREATE INDEX IF NOT EXISTS idx_damage_reports_coords
  ON public.damage_reports (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
