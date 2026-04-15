export const intakeDatabaseSchemaSql = `
  -- Create shop interest submissions table
  CREATE TABLE IF NOT EXISTS public.shop_interest_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_name TEXT NOT NULL,
    dmv_registration_number TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    website TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_shop_interest_submissions_status ON public.shop_interest_submissions(status);
  CREATE INDEX IF NOT EXISTS idx_shop_interest_submissions_created_at ON public.shop_interest_submissions(created_at DESC);

  ALTER TABLE public.shop_interest_submissions ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Public can submit shop interest" ON public.shop_interest_submissions;

  CREATE POLICY "Public can submit shop interest"
    ON public.shop_interest_submissions FOR INSERT WITH CHECK (true);

  DROP TRIGGER IF EXISTS set_updated_at ON public.shop_interest_submissions;
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.shop_interest_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

  -- Create insurer interest submissions table
  CREATE TABLE IF NOT EXISTS public.insurer_interest_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_insurer_interest_submissions_status ON public.insurer_interest_submissions(status);
  CREATE INDEX IF NOT EXISTS idx_insurer_interest_submissions_created_at ON public.insurer_interest_submissions(created_at DESC);

  ALTER TABLE public.insurer_interest_submissions ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Public can submit insurer interest" ON public.insurer_interest_submissions;

  CREATE POLICY "Public can submit insurer interest"
    ON public.insurer_interest_submissions FOR INSERT WITH CHECK (true);

  DROP TRIGGER IF EXISTS set_updated_at ON public.insurer_interest_submissions;
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.insurer_interest_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

  -- Create platform activity events table
  CREATE TABLE IF NOT EXISTS public.platform_activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    source TEXT,
    actor_id TEXT,
    object_id TEXT,
    outcome TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Add columns if table already exists without them
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'platform_activity_events' AND column_name = 'actor_id'
    ) THEN
      ALTER TABLE public.platform_activity_events ADD COLUMN actor_id TEXT;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'platform_activity_events' AND column_name = 'object_id'
    ) THEN
      ALTER TABLE public.platform_activity_events ADD COLUMN object_id TEXT;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'platform_activity_events' AND column_name = 'outcome'
    ) THEN
      ALTER TABLE public.platform_activity_events ADD COLUMN outcome TEXT;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS idx_platform_activity_events_type ON public.platform_activity_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_platform_activity_events_created_at ON public.platform_activity_events(created_at DESC);

  ALTER TABLE public.platform_activity_events ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Public can insert platform activity events" ON public.platform_activity_events;
  DROP POLICY IF EXISTS "Admins can read platform activity events" ON public.platform_activity_events;

  CREATE POLICY "Public can insert platform activity events"
    ON public.platform_activity_events FOR INSERT WITH CHECK (true);

  CREATE POLICY "Admins can read platform activity events"
    ON public.platform_activity_events FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.clerk_user_id = requesting_clerk_user_id()
        AND profiles.is_admin = TRUE
      )
    );
`;
