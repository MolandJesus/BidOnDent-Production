-- ============================================================================
-- BIDONDENT BUSINESS INTAKE + ACTIVITY TRACKING SETUP
-- ============================================================================
-- Run in Supabase SQL Editor to enable landing-page submission intake.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shop_interest_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.insurer_interest_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platform_activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  source TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  damage_report_id UUID REFERENCES public.damage_reports(id) ON DELETE CASCADE NOT NULL,
  customer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insurer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'awaiting_parts', 'completed', 'cancelled')),
  scheduled_start_at TIMESTAMP WITH TIME ZONE,
  estimated_completion_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_interest_submissions_status
  ON public.shop_interest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_shop_interest_submissions_created_at
  ON public.shop_interest_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insurer_interest_submissions_status
  ON public.insurer_interest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_insurer_interest_submissions_created_at
  ON public.insurer_interest_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_activity_events_type
  ON public.platform_activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_platform_activity_events_created_at
  ON public.platform_activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_assignments_customer_user_id
  ON public.job_assignments(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_shop_user_id
  ON public.job_assignments(shop_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_insurer_user_id
  ON public.job_assignments(insurer_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_status
  ON public.job_assignments(status);
CREATE INDEX IF NOT EXISTS idx_job_assignments_damage_report_id
  ON public.job_assignments(damage_report_id);

ALTER TABLE public.shop_interest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurer_interest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public shop submissions"
  ON public.shop_interest_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insurer submissions"
  ON public.insurer_interest_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public event inserts"
  ON public.platform_activity_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Customers can view own assignments"
  ON public.job_assignments FOR SELECT
  USING (auth.uid() = customer_user_id);

CREATE POLICY "Shops can view own assignments"
  ON public.job_assignments FOR SELECT
  USING (auth.uid() = shop_user_id);

CREATE POLICY "Insurers can view linked assignments"
  ON public.job_assignments FOR SELECT
  USING (auth.uid() = insurer_user_id);

CREATE POLICY "Shops can update own assignments"
  ON public.job_assignments FOR UPDATE
  USING (auth.uid() = shop_user_id);

CREATE POLICY "Insurers can update linked assignments"
  ON public.job_assignments FOR UPDATE
  USING (auth.uid() = insurer_user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_shop_interest_submissions_updated_at ON public.shop_interest_submissions;
CREATE TRIGGER update_shop_interest_submissions_updated_at
  BEFORE UPDATE ON public.shop_interest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurer_interest_submissions_updated_at ON public.insurer_interest_submissions;
CREATE TRIGGER update_insurer_interest_submissions_updated_at
  BEFORE UPDATE ON public.insurer_interest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_assignments_updated_at ON public.job_assignments;
CREATE TRIGGER update_job_assignments_updated_at
  BEFORE UPDATE ON public.job_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
