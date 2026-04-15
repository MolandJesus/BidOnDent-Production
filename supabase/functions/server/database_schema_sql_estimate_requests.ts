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

  DROP POLICY IF EXISTS estimate_requests_service_role_all ON public.estimate_requests;
  DROP POLICY IF EXISTS "Customers can read their own estimate requests" ON public.estimate_requests;
  DROP POLICY IF EXISTS "Customers can insert their own estimate requests" ON public.estimate_requests;
  DROP POLICY IF EXISTS "Shops can read estimate requests sent to them" ON public.estimate_requests;

  CREATE POLICY "Customers can read their own estimate requests"
    ON public.estimate_requests FOR SELECT
    USING (clerk_customer_user_id = requesting_clerk_user_id());

  CREATE POLICY "Customers can insert their own estimate requests"
    ON public.estimate_requests FOR INSERT
    WITH CHECK (clerk_customer_user_id = requesting_clerk_user_id());

  CREATE POLICY "Shops can read estimate requests sent to them"
    ON public.estimate_requests FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.clerk_user_id = requesting_clerk_user_id()
        AND profiles.account_type = 'shop'
      )
    );
`;
