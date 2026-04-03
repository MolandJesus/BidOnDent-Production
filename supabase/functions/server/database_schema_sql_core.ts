export const coreDatabaseSchemaSql = `
  -- Create or replace function for updated_at trigger first
  CREATE OR REPLACE FUNCTION public.handle_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create profiles table
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    profile_image_url TEXT,
    account_type TEXT NOT NULL CHECK (account_type IN ('customer', 'shop', 'insurer')),
    setup_completed BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'setup_completed'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN setup_completed BOOLEAN DEFAULT FALSE;
    END IF;
  END $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'last_login'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMPTZ;
    END IF;
  END $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_admin'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
  END $$;

  DO $$
  BEGIN
    UPDATE public.profiles
    SET is_admin = TRUE
    WHERE email = 'figmaadmin@bidondent.com';
  END $$;

  CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
  CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

  CREATE POLICY "Users can read all profiles"
    ON public.profiles FOR SELECT USING (true);

  CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own profile"
    ON public.profiles FOR DELETE USING (auth.uid() = user_id);

  DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

  -- Create vehicles table
  CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT,
    license_plate TEXT,
    vin TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'vehicles'
      AND column_name = 'clerk_user_id'
    ) THEN
      ALTER TABLE public.vehicles ADD COLUMN clerk_user_id TEXT;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'vehicles'
      AND column_name = 'user_id'
      AND is_nullable = 'NO'
    ) THEN
      ALTER TABLE public.vehicles ALTER COLUMN user_id DROP NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE tablename = 'vehicles'
      AND indexname = 'idx_vehicles_clerk_user_id'
    ) THEN
      EXECUTE 'CREATE INDEX idx_vehicles_clerk_user_id ON public.vehicles(clerk_user_id)';
    END IF;
  END $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'vehicles_user_id_or_clerk_user_id'
    ) THEN
      ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_user_id_or_clerk_user_id
      CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL);
    END IF;
  END $$;

  ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can read their own vehicles" ON public.vehicles;
  DROP POLICY IF EXISTS "Users can insert their own vehicles" ON public.vehicles;
  DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
  DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;

  CREATE POLICY "Users can read their own vehicles"
    ON public.vehicles FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own vehicles"
    ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own vehicles"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own vehicles"
    ON public.vehicles FOR DELETE USING (auth.uid() = user_id);

  DROP TRIGGER IF EXISTS set_updated_at ON public.vehicles;
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

  -- Create damage_reports table
  CREATE TABLE IF NOT EXISTS public.damage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    clerk_user_id TEXT,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year INTEGER NOT NULL,
    damage_type TEXT NOT NULL,
    damage_severity TEXT NOT NULL,
    damage_description TEXT,
    damage_location TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo_urls TEXT[] DEFAULT '{}',
    insurance_claim BOOLEAN DEFAULT false,
    insurance_company TEXT,
    preferred_contact TEXT,
    additional_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'in-progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_id_or_clerk_user_id CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL)
  );

  CREATE INDEX IF NOT EXISTS idx_damage_reports_user_id ON public.damage_reports(user_id);
  CREATE INDEX IF NOT EXISTS idx_damage_reports_clerk_user_id ON public.damage_reports(clerk_user_id);
  CREATE INDEX IF NOT EXISTS idx_damage_reports_vehicle_id ON public.damage_reports(vehicle_id);
  CREATE INDEX IF NOT EXISTS idx_damage_reports_status ON public.damage_reports(status);
  CREATE INDEX IF NOT EXISTS idx_damage_reports_created_at ON public.damage_reports(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_damage_reports_coords ON public.damage_reports(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

  ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can read their own damage reports" ON public.damage_reports;
  DROP POLICY IF EXISTS "Shops and insurers can read all damage reports" ON public.damage_reports;
  DROP POLICY IF EXISTS "Users can insert their own damage reports" ON public.damage_reports;
  DROP POLICY IF EXISTS "Users can update their own damage reports" ON public.damage_reports;
  DROP POLICY IF EXISTS "Users can delete their own damage reports" ON public.damage_reports;

  CREATE POLICY "Users can read their own damage reports"
    ON public.damage_reports FOR SELECT
    USING (
      auth.uid() = user_id
      OR clerk_user_id IN (
        SELECT p.clerk_user_id FROM public.profiles p WHERE p.user_id = auth.uid()
      )
    );

  CREATE POLICY "Shops and insurers can read all damage reports"
    ON public.damage_reports FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.account_type IN ('shop', 'insurer')
      )
    );

  CREATE POLICY "Users can insert their own damage reports"
    ON public.damage_reports FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
      OR clerk_user_id IN (
        SELECT p.clerk_user_id FROM public.profiles p WHERE p.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update their own damage reports"
    ON public.damage_reports FOR UPDATE
    USING (
      auth.uid() = user_id
      OR clerk_user_id IN (
        SELECT p.clerk_user_id FROM public.profiles p WHERE p.user_id = auth.uid()
      )
    )
    WITH CHECK (
      auth.uid() = user_id
      OR clerk_user_id IN (
        SELECT p.clerk_user_id FROM public.profiles p WHERE p.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete their own damage reports"
    ON public.damage_reports FOR DELETE
    USING (
      auth.uid() = user_id
      OR clerk_user_id IN (
        SELECT p.clerk_user_id FROM public.profiles p WHERE p.user_id = auth.uid()
      )
    );

  DROP TRIGGER IF EXISTS set_updated_at ON public.damage_reports;
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.damage_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
`;
