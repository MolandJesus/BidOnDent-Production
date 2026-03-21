export const bidFlowDatabaseSchemaSql = `
  -- Create bids table
  CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    damage_report_id UUID REFERENCES public.damage_reports(id) ON DELETE CASCADE NOT NULL,
    shop_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    clerk_shop_user_id TEXT,
    shop_name TEXT,
    shop_email TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    estimated_days INTEGER NOT NULL,
    description TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    shop_rating DECIMAL(3, 2),
    shop_reviews INTEGER,
    shop_distance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'shop_user_id'
      AND is_nullable = 'NO'
    ) THEN
      ALTER TABLE public.bids ALTER COLUMN shop_user_id DROP NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'clerk_shop_user_id'
    ) THEN
      ALTER TABLE public.bids ADD COLUMN clerk_shop_user_id TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'shop_name'
    ) THEN
      ALTER TABLE public.bids ADD COLUMN shop_name TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'shop_email'
    ) THEN
      ALTER TABLE public.bids ADD COLUMN shop_email TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'notes'
    ) THEN
      ALTER TABLE public.bids ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'shop_rating'
    ) THEN
      ALTER TABLE public.bids ADD COLUMN shop_rating DECIMAL(3, 2);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'shop_reviews'
    ) THEN
      ALTER TABLE public.bids ADD COLUMN shop_reviews INTEGER;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'shop_distance'
    ) THEN
      ALTER TABLE public.bids ADD COLUMN shop_distance TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'bids'
      AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE public.bids ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  END $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'bids_shop_identity_check'
    ) THEN
      ALTER TABLE public.bids
      ADD CONSTRAINT bids_shop_identity_check
      CHECK (shop_user_id IS NOT NULL OR clerk_shop_user_id IS NOT NULL);
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS idx_bids_damage_report_id ON public.bids(damage_report_id);
  CREATE INDEX IF NOT EXISTS idx_bids_shop_user_id ON public.bids(shop_user_id);
  CREATE INDEX IF NOT EXISTS idx_bids_clerk_shop_user_id ON public.bids(clerk_shop_user_id);
  CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);

  ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Authenticated users can read bids" ON public.bids;
  DROP POLICY IF EXISTS "Authenticated shops can manage bids" ON public.bids;

  CREATE POLICY "Authenticated users can read bids"
    ON public.bids FOR SELECT USING (auth.role() = 'authenticated');

  CREATE POLICY "Authenticated shops can manage bids"
    ON public.bids FOR ALL
    USING (auth.uid() = shop_user_id)
    WITH CHECK (auth.uid() = shop_user_id);

  DROP TRIGGER IF EXISTS set_updated_at ON public.bids;
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

  -- Create public partner shops table
  CREATE TABLE IF NOT EXISTS public.public_partner_shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating DECIMAL(3, 2),
    specialties TEXT[] DEFAULT '{}',
    phone_number TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_public_partner_shops_active ON public.public_partner_shops(is_active);
  CREATE INDEX IF NOT EXISTS idx_public_partner_shops_zip_code ON public.public_partner_shops(zip_code);

  ALTER TABLE public.public_partner_shops ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Public can read active partner shops" ON public.public_partner_shops;

  CREATE POLICY "Public can read active partner shops"
    ON public.public_partner_shops FOR SELECT USING (is_active = true);

  DROP TRIGGER IF EXISTS set_updated_at ON public.public_partner_shops;
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.public_partner_shops
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

  -- Create job assignments table
  CREATE TABLE IF NOT EXISTS public.job_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    damage_report_id UUID REFERENCES public.damage_reports(id) ON DELETE CASCADE NOT NULL,
    customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shop_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    insurer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_clerk_user_id TEXT,
    shop_clerk_user_id TEXT,
    insurer_clerk_user_id TEXT,
    bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'awaiting_parts', 'completed', 'cancelled')),
    scheduled_start_at TIMESTAMPTZ,
    estimated_completion_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_job_assignments_damage_report_id ON public.job_assignments(damage_report_id);
  CREATE INDEX IF NOT EXISTS idx_job_assignments_bid_id ON public.job_assignments(bid_id);
  CREATE INDEX IF NOT EXISTS idx_job_assignments_shop_clerk_user_id ON public.job_assignments(shop_clerk_user_id);

  ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

  DROP TRIGGER IF EXISTS set_updated_at ON public.job_assignments;
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.job_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
`;
