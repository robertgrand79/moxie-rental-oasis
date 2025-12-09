-- Drop the overly permissive organization-wide SELECT policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

-- Create a more restrictive policy: only org admins/owners can view member profiles
CREATE POLICY "Organization admins can view member profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User can always see their own profile
  auth.uid() = id
  OR
  -- Platform admins can see all profiles
  public.is_admin()
  OR
  -- Organization admins/owners can see profiles of their org members
  (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
      AND om.organization_id = profiles.organization_id
      AND om.role IN ('owner', 'admin')
    )
  )
);