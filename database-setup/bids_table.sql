-- ============================================================================
-- BIDONDENT BIDS TABLE SETUP
-- ============================================================================
-- This file contains the SQL needed to set up the bids table and enable
-- real-time subscriptions in Supabase.
--
-- RUN THIS IN SUPABASE SQL EDITOR:
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- 1. Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID,
  report_id UUID REFERENCES public.damage_reports(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_email TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  estimated_days INTEGER NOT NULL CHECK (estimated_days >= 0),
  description TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  shop_rating NUMERIC(3, 2) CHECK (shop_rating >= 0 AND shop_rating <= 5),
  shop_reviews INTEGER CHECK (shop_reviews >= 0),
  shop_distance TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bids_report_id ON public.bids(report_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_shop_id ON public.bids(shop_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Policy: Users can view bids for their own damage reports
CREATE POLICY "Users can view bids for their reports"
  ON public.bids
  FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM public.damage_reports WHERE user_id = auth.uid()
    )
  );

-- Policy: Shop users can view their own submitted bids
CREATE POLICY "Shops can view their own bids"
  ON public.bids
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Shop users can insert bids
CREATE POLICY "Shops can submit bids"
  ON public.bids
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Shop users can update their own bids
CREATE POLICY "Shops can update their own bids"
  ON public.bids
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Customers can update bid status (accept/reject) for their reports
CREATE POLICY "Customers can update bid status for their reports"
  ON public.bids
  FOR UPDATE
  USING (
    report_id IN (
      SELECT id FROM public.damage_reports WHERE user_id = auth.uid()
    )
  );

-- Policy: Shop users can delete their own bids
CREATE POLICY "Shops can delete their own bids"
  ON public.bids
  FOR DELETE
  USING (user_id = auth.uid());

-- 5. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Real-time for the bids table
-- This allows instant notifications when bids are created/updated
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bids TO authenticated;
GRANT USAGE ON SEQUENCE IF EXISTS bids_id_seq TO authenticated;

-- 8. Create view for bid statistics (optional)
CREATE OR REPLACE VIEW public.bid_statistics AS
SELECT
  report_id,
  COUNT(*) as total_bids,
  MIN(amount) as lowest_bid,
  MAX(amount) as highest_bid,
  AVG(amount) as average_bid,
  MIN(estimated_days) as fastest_completion
FROM public.bids
WHERE status = 'pending'
GROUP BY report_id;

GRANT SELECT ON public.bid_statistics TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the setup:

-- Check if table exists
-- SELECT EXISTS (
--   SELECT FROM pg_tables
--   WHERE schemaname = 'public' AND tablename = 'bids'
-- );

-- Check if real-time is enabled
-- SELECT * FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime' AND tablename = 'bids';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'bids';

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================
-- Uncomment to insert test data:

-- INSERT INTO public.bids (
--   user_id,
--   shop_id,
--   report_id,
--   shop_name,
--   shop_email,
--   amount,
--   estimated_days,
--   description,
--   notes,
--   status,
--   shop_rating,
--   shop_reviews,
--   shop_distance
-- ) VALUES (
--   auth.uid(), -- Current user
--   auth.uid(),
--   'YOUR-REPORT-ID-HERE',
--   'Test Auto Body Shop',
--   'test@shop.com',
--   1250.50,
--   3,
--   'Front bumper replacement and paint',
--   'Parts in stock, can start tomorrow',
--   'pending',
--   4.5,
--   127,
--   '2.3 miles'
-- );

-- ============================================================================
-- CLEANUP (ONLY IF YOU NEED TO START OVER)
-- ============================================================================
-- WARNING: This will delete ALL bid data!

-- DROP TRIGGER IF EXISTS update_bids_updated_at ON public.bids;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.bids;
-- DROP VIEW IF EXISTS public.bid_statistics;
-- DROP TABLE IF EXISTS public.bids CASCADE;

-- ============================================================================
-- DONE!
-- ============================================================================
-- The bids table is now ready for use with real-time subscriptions enabled.
-- Your app will receive instant notifications when:
-- - New bids are submitted
-- - Bid status changes (accepted/rejected)
-- - Bids are updated or deleted
-- ============================================================================
