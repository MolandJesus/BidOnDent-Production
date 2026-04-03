export const estimateRequestsDatabaseSchemaSql = `
  -- Create estimate_requests table
  CREATE TABLE IF NOT EXISTS public.estimate_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_customer_user_id TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    shop_id INTEGER,
    shop_name TEXT,
    description TEXT NOT NULL,
    timeline TEXT DEFAULT 'flexible' CHECK (timeline IN ('urgent', 'this-week', 'flexible')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'responded', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Add updated_at trigger
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'set_estimate_requests_updated_at'
    ) THEN
      CREATE TRIGGER set_estimate_requests_updated_at
        BEFORE UPDATE ON public.estimate_requests
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
  END
  $$;

  -- RLS policies
  ALTER TABLE public.estimate_requests ENABLE ROW LEVEL SECURITY;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'estimate_requests' AND policyname = 'estimate_requests_service_role_all'
    ) THEN
      CREATE POLICY estimate_requests_service_role_all ON public.estimate_requests
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END
  $$;
`;
