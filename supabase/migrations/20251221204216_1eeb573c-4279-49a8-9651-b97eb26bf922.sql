-- Fix RLS policies on profiles table to require authentication
-- Drop the policies that incorrectly use public role

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Org members can view org member profiles" ON public.profiles;

-- Recreate with authenticated role only
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Org members can view org member profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (organization_id IS NOT NULL) 
  AND user_belongs_to_organization(auth.uid(), organization_id)
);