-- Fix guest_profiles RLS policies to require authentication

-- Drop existing policies that use public role
DROP POLICY IF EXISTS "Admins can manage all guest profiles" ON public.guest_profiles;
DROP POLICY IF EXISTS "Guests can view and update their own profile" ON public.guest_profiles;
DROP POLICY IF EXISTS "Public can create guest profiles with validation" ON public.guest_profiles;
DROP POLICY IF EXISTS "Admins can view all guest profiles" ON public.guest_profiles;
DROP POLICY IF EXISTS "Users can view their own guest profile" ON public.guest_profiles;

-- Recreate with authenticated role only

-- Admins can manage all guest profiles
CREATE POLICY "Admins can manage all guest profiles"
ON public.guest_profiles
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Users can view and manage their own guest profile
CREATE POLICY "Users can manage their own guest profile"
ON public.guest_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Authenticated users can create guest profiles (for themselves or when user_id is null for guest checkout)
CREATE POLICY "Authenticated users can create guest profiles"
ON public.guest_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND email IS NOT NULL 
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Service role can manage guest profiles (for edge functions handling guest bookings)
CREATE POLICY "Service role can manage guest profiles"
ON public.guest_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);