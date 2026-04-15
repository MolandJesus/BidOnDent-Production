/**
 * Database Initialization
 * Creates all required tables if they don't exist using direct SQL execution
 */

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const DB_URL = Deno.env.get('SUPABASE_DB_URL') ?? '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

/**
 * Initialize all database tables
 */
export async function initializeDatabaseTables() {
  console.log('🔧 Initializing database tables...');

  if (!DB_URL) {
    console.warn('⚠️ SUPABASE_DB_URL is not set. Skipping DB init.');
    return;
  }

  try {
    // Lazy-load postgres client - only when needed
    const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
    const client = new Client(DB_URL);

    await client.connect();
    console.log('✅ Connected to database');

    try {
      // Suppress notices by setting client_min_messages to WARNING
      await client.queryArray("SET client_min_messages TO WARNING;");

      // Execute all SQL in a single transaction to avoid deadlocks
      const allSQL = `
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
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
          clerk_user_id TEXT,
          website_user_key TEXT,
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

        -- Add setup_completed column if it doesn't exist (for existing databases)
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = 'setup_completed'
          ) THEN
            ALTER TABLE public.profiles ADD COLUMN setup_completed BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added setup_completed column to profiles table';
          END IF;
        END $$;

        -- Add Clerk-first identity columns if they don't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = 'clerk_user_id'
          ) THEN
            ALTER TABLE public.profiles ADD COLUMN clerk_user_id TEXT;
            RAISE NOTICE 'Added clerk_user_id column to profiles table';
          END IF;
        END $$;

        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = 'website_user_key'
          ) THEN
            ALTER TABLE public.profiles ADD COLUMN website_user_key TEXT;
            RAISE NOTICE 'Added website_user_key column to profiles table';
          END IF;
        END $$;

        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = 'user_id'
            AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;
            RAISE NOTICE 'Dropped NOT NULL requirement from profiles.user_id';
          END IF;
        END $$;

        -- Add last_login column if it doesn't exist (for existing databases)
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = 'last_login'
          ) THEN
            ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMPTZ;
            RAISE NOTICE 'Added last_login column to profiles table';
          END IF;
        END $$;

        -- Add is_admin column if it doesn't exist (for existing databases)
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = 'is_admin'
          ) THEN
            ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added is_admin column to profiles table';
          END IF;
        END $$;

        -- Set super admin (figmaadmin@bidondent.com) as admin
        DO $$
        BEGIN
          UPDATE public.profiles
          SET is_admin = TRUE
          WHERE email = 'figmaadmin@bidondent.com';
          RAISE NOTICE 'Set figmaadmin@bidondent.com as admin';
        END $$;

        CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_website_user_key ON public.profiles(website_user_key);

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

        -- Create provider-agnostic website preferences table
        CREATE TABLE IF NOT EXISTS public.website_preferences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          website_user_key TEXT UNIQUE NOT NULL,
          provider TEXT,
          provider_user_id TEXT,
          clerk_user_id TEXT,
          normalized_email TEXT,
          display_name TEXT,
          account_type TEXT CHECK (account_type IN ('customer', 'shop', 'insurer')),
          session_memory JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_website_preferences_user_key
          ON public.website_preferences(website_user_key);
        CREATE INDEX IF NOT EXISTS idx_website_preferences_provider_user_id
          ON public.website_preferences(provider_user_id);
        CREATE INDEX IF NOT EXISTS idx_website_preferences_clerk_user_id
          ON public.website_preferences(clerk_user_id);
        CREATE INDEX IF NOT EXISTS idx_website_preferences_normalized_email
          ON public.website_preferences(normalized_email);

        ALTER TABLE public.website_preferences ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role manages website preferences" ON public.website_preferences;
        CREATE POLICY "Service role manages website preferences"
          ON public.website_preferences
          USING (false)
          WITH CHECK (false);

        DROP TRIGGER IF EXISTS set_updated_at ON public.website_preferences;
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON public.website_preferences
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_updated_at();

        -- Create durable provider-agnostic relationship records
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

        -- Create provider-agnostic shop profiles table
        CREATE TABLE IF NOT EXISTS public.shop_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          clerk_user_id TEXT,
          website_user_key TEXT,
          business_name TEXT NOT NULL,
          business_address TEXT,
          business_city TEXT,
          business_state TEXT,
          business_zip TEXT,
          business_phone TEXT,
          website TEXT,
          business_hours TEXT,
          certifications TEXT[] DEFAULT '{}',
          specialties TEXT[] DEFAULT '{}',
          insurer_programs TEXT[] DEFAULT '{}',
          supported_makes TEXT[] DEFAULT '{}',
          average_rating DECIMAL(3, 2) DEFAULT 0.00,
          total_reviews INTEGER DEFAULT 0,
          is_accepting_bids BOOLEAN DEFAULT TRUE,
          average_ticket_value NUMERIC(10, 2),
          response_time_hours INTEGER DEFAULT 3,
          completion_rate INTEGER DEFAULT 95,
          profile_image_url TEXT,
          about_summary TEXT,
          geo_latitude DOUBLE PRECISION,
          geo_longitude DOUBLE PRECISION,
          accepts_insurance_claims BOOLEAN DEFAULT FALSE,
          offers_estimates BOOLEAN DEFAULT FALSE,
          is_directory_visible BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'shop_profiles'
            AND column_name = 'user_id'
            AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE public.shop_profiles ALTER COLUMN user_id DROP NOT NULL;
          END IF;
        END $$;

        ALTER TABLE public.shop_profiles
          ADD COLUMN IF NOT EXISTS clerk_user_id TEXT,
          ADD COLUMN IF NOT EXISTS website_user_key TEXT,
          ADD COLUMN IF NOT EXISTS website TEXT,
          ADD COLUMN IF NOT EXISTS business_hours TEXT,
          ADD COLUMN IF NOT EXISTS insurer_programs TEXT[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS supported_makes TEXT[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS average_ticket_value NUMERIC(10, 2),
          ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 3,
          ADD COLUMN IF NOT EXISTS completion_rate INTEGER DEFAULT 95,
          ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
          ADD COLUMN IF NOT EXISTS about_summary TEXT,
          ADD COLUMN IF NOT EXISTS geo_latitude DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS geo_longitude DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS accepts_insurance_claims BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS offers_estimates BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS is_directory_visible BOOLEAN DEFAULT TRUE;

        CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_profiles_website_user_key
          ON public.shop_profiles(website_user_key);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_profiles_clerk_user_id
          ON public.shop_profiles(clerk_user_id);

        ALTER TABLE public.shop_profiles ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Authenticated users can read shop profiles" ON public.shop_profiles;
        DROP POLICY IF EXISTS "Shop owners can manage their own profile" ON public.shop_profiles;

        CREATE POLICY "Authenticated users can read shop profiles"
          ON public.shop_profiles FOR SELECT
          USING (requesting_clerk_user_id() IS NOT NULL OR auth.role() = 'authenticated');

        CREATE POLICY "Shop owners can manage their own profile"
          ON public.shop_profiles FOR ALL
          USING (
            clerk_user_id = requesting_clerk_user_id()
            OR user_id = auth.uid()
          )
          WITH CHECK (
            clerk_user_id = requesting_clerk_user_id()
            OR user_id = auth.uid()
          );

        DROP TRIGGER IF EXISTS set_updated_at ON public.shop_profiles;
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON public.shop_profiles
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_updated_at();

        -- Create provider-agnostic insurer profiles table
        CREATE TABLE IF NOT EXISTS public.insurer_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          clerk_user_id TEXT,
          website_user_key TEXT,
          company_name TEXT NOT NULL,
          company_address TEXT,
          company_city TEXT,
          company_state TEXT,
          company_zip TEXT,
          company_phone TEXT,
          license_number TEXT,
          license_state TEXT,
          website TEXT,
          claim_types TEXT[] DEFAULT '{}',
          preferred_shops BOOLEAN DEFAULT FALSE,
          auto_approval BOOLEAN DEFAULT FALSE,
          max_claim_amount NUMERIC(10, 2),
          description TEXT,
          repair_program_focus TEXT[] DEFAULT '{}',
          benefits TEXT[] DEFAULT '{}',
          account_connection_notes TEXT[] DEFAULT '{}',
          digital_claims_experience TEXT DEFAULT 'standard',
          popular BOOLEAN DEFAULT FALSE,
          profile_image_url TEXT,
          is_directory_visible BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'insurer_profiles'
            AND column_name = 'user_id'
            AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE public.insurer_profiles ALTER COLUMN user_id DROP NOT NULL;
          END IF;
        END $$;

        ALTER TABLE public.insurer_profiles
          ADD COLUMN IF NOT EXISTS clerk_user_id TEXT,
          ADD COLUMN IF NOT EXISTS website_user_key TEXT,
          ADD COLUMN IF NOT EXISTS website TEXT,
          ADD COLUMN IF NOT EXISTS claim_types TEXT[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS preferred_shops BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS auto_approval BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS max_claim_amount NUMERIC(10, 2),
          ADD COLUMN IF NOT EXISTS description TEXT,
          ADD COLUMN IF NOT EXISTS repair_program_focus TEXT[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS account_connection_notes TEXT[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS digital_claims_experience TEXT DEFAULT 'standard',
          ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
          ADD COLUMN IF NOT EXISTS is_directory_visible BOOLEAN DEFAULT TRUE;

        CREATE UNIQUE INDEX IF NOT EXISTS idx_insurer_profiles_website_user_key
          ON public.insurer_profiles(website_user_key);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_insurer_profiles_clerk_user_id
          ON public.insurer_profiles(clerk_user_id);

        ALTER TABLE public.insurer_profiles ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Authenticated users can read insurer profiles" ON public.insurer_profiles;
        DROP POLICY IF EXISTS "Insurer owners can manage their own profile" ON public.insurer_profiles;

        CREATE POLICY "Authenticated users can read insurer profiles"
          ON public.insurer_profiles FOR SELECT
          USING (requesting_clerk_user_id() IS NOT NULL OR auth.role() = 'authenticated');

        CREATE POLICY "Insurer owners can manage their own profile"
          ON public.insurer_profiles FOR ALL
          USING (
            clerk_user_id = requesting_clerk_user_id()
            OR user_id = auth.uid()
          )
          WITH CHECK (
            clerk_user_id = requesting_clerk_user_id()
            OR user_id = auth.uid()
          );

        DROP TRIGGER IF EXISTS set_updated_at ON public.insurer_profiles;
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON public.insurer_profiles
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

        -- Add clerk_user_id column if it doesn't exist (for existing databases)
        DO $$
        BEGIN
          -- Add clerk_user_id column
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'vehicles'
            AND column_name = 'clerk_user_id'
          ) THEN
            ALTER TABLE public.vehicles ADD COLUMN clerk_user_id TEXT;
            RAISE NOTICE 'Added clerk_user_id column to vehicles table';
          END IF;

          -- Make user_id nullable if it's currently NOT NULL
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'vehicles'
            AND column_name = 'user_id'
            AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE public.vehicles ALTER COLUMN user_id DROP NOT NULL;
            RAISE NOTICE 'Made user_id nullable in vehicles table';
          END IF;

          -- Create index on clerk_user_id if it doesn't exist (using EXECUTE for DDL)
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'vehicles'
            AND indexname = 'idx_vehicles_clerk_user_id'
          ) THEN
            EXECUTE 'CREATE INDEX idx_vehicles_clerk_user_id ON public.vehicles(clerk_user_id)';
            RAISE NOTICE 'Created index on clerk_user_id in vehicles table';
          END IF;
        END $$;

        -- Add constraint to ensure either user_id OR clerk_user_id exists
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'vehicles_user_id_or_clerk_user_id'
          ) THEN
            ALTER TABLE public.vehicles
            ADD CONSTRAINT vehicles_user_id_or_clerk_user_id
            CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL);
            RAISE NOTICE 'Added constraint to vehicles table';
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
          photo_urls TEXT[] DEFAULT '{}',
          insurance_claim BOOLEAN DEFAULT false,
          insurance_company TEXT,
          preferred_contact TEXT,
          additional_notes TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'in-progress', 'completed', 'cancelled')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          -- Constraint: Must have either user_id OR clerk_user_id
          CONSTRAINT user_id_or_clerk_user_id CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL)
        );

        CREATE INDEX IF NOT EXISTS idx_damage_reports_user_id ON public.damage_reports(user_id);
        CREATE INDEX IF NOT EXISTS idx_damage_reports_clerk_user_id ON public.damage_reports(clerk_user_id);
        CREATE INDEX IF NOT EXISTS idx_damage_reports_vehicle_id ON public.damage_reports(vehicle_id);
        CREATE INDEX IF NOT EXISTS idx_damage_reports_status ON public.damage_reports(status);
        CREATE INDEX IF NOT EXISTS idx_damage_reports_created_at ON public.damage_reports(created_at DESC);

        -- Make user_id nullable for Clerk-based auth (existing tables may still have NOT NULL)
        ALTER TABLE public.damage_reports ALTER COLUMN user_id DROP NOT NULL;

        -- Add clerk_user_id column if missing
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'damage_reports'
            AND column_name = 'clerk_user_id'
          ) THEN
            ALTER TABLE public.damage_reports ADD COLUMN clerk_user_id TEXT;
          END IF;
        END $$;

        -- Add check constraint if missing
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'user_id_or_clerk_user_id'
            AND conrelid = 'public.damage_reports'::regclass
          ) THEN
            ALTER TABLE public.damage_reports
              ADD CONSTRAINT user_id_or_clerk_user_id
              CHECK (user_id IS NOT NULL OR clerk_user_id IS NOT NULL);
          END IF;
        END $$;

        ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can read their own damage reports" ON public.damage_reports;
        DROP POLICY IF EXISTS "Shops and insurers can read all damage reports" ON public.damage_reports;
        DROP POLICY IF EXISTS "Users can insert their own damage reports" ON public.damage_reports;
        DROP POLICY IF EXISTS "Users can update their own damage reports" ON public.damage_reports;
        DROP POLICY IF EXISTS "Users can delete their own damage reports" ON public.damage_reports;

        CREATE POLICY "Users can read their own damage reports"
          ON public.damage_reports FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Shops and insurers can read all damage reports"
          ON public.damage_reports FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE user_id = auth.uid()
              AND account_type IN ('shop', 'insurer')
            )
          );

        CREATE POLICY "Users can insert their own damage reports"
          ON public.damage_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own damage reports"
          ON public.damage_reports FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own damage reports"
          ON public.damage_reports FOR DELETE USING (auth.uid() = user_id);

        DROP TRIGGER IF EXISTS set_updated_at ON public.damage_reports;
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON public.damage_reports
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_updated_at();
      `;

      await client.queryArray(allSQL);
      console.log('✅ Database tables and policies initialized successfully');

      // Notify PostgREST to reload schema cache
      try {
        await client.queryArray("NOTIFY pgrst, 'reload schema';");
        console.log('✅ PostgREST schema cache reload notification sent');
      } catch (notifyError) {
        console.log('⚠️ Could not notify PostgREST (this is okay)');
      }

    } catch (error) {
      // Only log error if it's not about existing objects
      if (!error.message.includes('already exists') &&
          !error.message.includes('does not exist, skipping')) {
        console.error('❌ Database initialization error:', error);
      }
      console.log('⚠️ Database initialization completed with notices (this is normal if tables already exist)');
    } finally {
      // Always close the connection
      if (client) {
        try {
          await client.end();
        } catch (e) {
          // Ignore close errors
        }
      }
    }

    // Verify tables were created successfully
    try {
      const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
      const verifyClient = new Client(DB_URL);
      await verifyClient.connect();

      const result = await verifyClient.queryArray(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'vehicles', 'damage_reports')"
      );

      await verifyClient.end();

      if (result.rows.length === 3) {
        console.log('✅ All 3 tables verified: profiles, vehicles, damage_reports');
        console.log('✅ Database is ready for use!');
      } else {
        console.log(`⚠️ Found ${result.rows.length}/3 expected tables`);
      }
    } catch (verifyError) {
      console.log('⚠️ Could not verify tables, but initialization completed');
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
  }
}
