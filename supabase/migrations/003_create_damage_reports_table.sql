-- Create damage_reports table
CREATE TABLE IF NOT EXISTS public.damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_damage_reports_user_id ON public.damage_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_vehicle_id ON public.damage_reports(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_status ON public.damage_reports(status);
CREATE INDEX IF NOT EXISTS idx_damage_reports_created_at ON public.damage_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own damage reports
CREATE POLICY "Users can read their own damage reports"
  ON public.damage_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Shops and insurers can read all damage reports
CREATE POLICY "Shops and insurers can read all damage reports"
  ON public.damage_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND account_type IN ('shop', 'insurer')
    )
  );

-- Create policy: Users can insert their own damage reports
CREATE POLICY "Users can insert their own damage reports"
  ON public.damage_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own damage reports
CREATE POLICY "Users can update their own damage reports"
  ON public.damage_reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own damage reports
CREATE POLICY "Users can delete their own damage reports"
  ON public.damage_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.damage_reports;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
