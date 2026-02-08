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