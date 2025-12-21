-- Fix Priority 3: PII Exposure in profiles and contractors tables

-- ============================================
-- PROFILES TABLE - Restrict PII access
-- ============================================

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restrictive policies:
-- 1. Users can view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 2. Admins can view all profiles (using security definer function)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- 3. Organization members can view basic info of other members in same org
CREATE POLICY "Org members can view org member profiles"
ON public.profiles
FOR SELECT
USING (
  organization_id IS NOT NULL 
  AND public.user_belongs_to_organization(auth.uid(), organization_id)
);

-- ============================================
-- CONTRACTORS TABLE - Restrict PII access
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can view all contractors" ON public.contractors;
DROP POLICY IF EXISTS "Anyone can view contractors" ON public.contractors;

-- Create restrictive policies:
-- 1. Organization members can view their org's contractors
CREATE POLICY "Org members can view org contractors"
ON public.contractors
FOR SELECT
USING (
  organization_id IS NOT NULL 
  AND public.user_belongs_to_organization(auth.uid(), organization_id)
);

-- 2. Contractors created by user are visible to that user
CREATE POLICY "Users can view contractors they created"
ON public.contractors
FOR SELECT
USING (auth.uid() = created_by);

-- 3. Platform admins can view all contractors
CREATE POLICY "Platform admins can view all contractors"
ON public.contractors
FOR SELECT
USING (public.is_platform_admin(auth.uid()));