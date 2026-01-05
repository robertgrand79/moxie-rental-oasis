-- Phase 1: Critical Security Fixes
-- Fix 1: Remove public access from property_access_details (door codes exposed!)
DROP POLICY IF EXISTS "Public can view access details" ON property_access_details;

-- Fix 2: Fix guest_profiles service role policy
DROP POLICY IF EXISTS "Service role can manage guest profiles" ON guest_profiles;
CREATE POLICY "Service role can manage guest profiles" ON guest_profiles
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Fix 3: Fix guest_communications service role policy  
DROP POLICY IF EXISTS "Service role can manage communications" ON guest_communications;
CREATE POLICY "Service role can manage communications" ON guest_communications
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Fix 4: Fix newsletter_click_tracking service role policy
DROP POLICY IF EXISTS "Service role can manage click tracking" ON newsletter_click_tracking;
CREATE POLICY "Service role can manage click tracking" ON newsletter_click_tracking
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');