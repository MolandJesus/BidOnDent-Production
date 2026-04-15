-- Durable provider-agnostic relationship records for map collections and carrier links.

CREATE TABLE IF NOT EXISTS public.website_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_user_key TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('customer', 'shop', 'insurer')),
  relationship_type TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('shop', 'insurer')),
  target_id TEXT NOT NULL,
  target_label TEXT,
  target_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (website_user_key, relationship_type, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_website_relationships_user_key
  ON public.website_relationships(website_user_key);

CREATE INDEX IF NOT EXISTS idx_website_relationships_type
  ON public.website_relationships(relationship_type);

ALTER TABLE public.website_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages website relationships" ON public.website_relationships;
CREATE POLICY "Service role manages website relationships"
  ON public.website_relationships
  USING (false)
  WITH CHECK (false);

DROP TRIGGER IF EXISTS set_updated_at ON public.website_relationships;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.website_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
