
-- Fix infinite recursion: create a SECURITY DEFINER function to check org membership role
-- This breaks the circular dependency where org_members policy queries org_members
CREATE OR REPLACE FUNCTION public.user_is_org_owner_or_manager(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _organization_id
      AND (team_role IN ('owner', 'manager') OR role = 'owner')
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Owners and managers can manage members" ON public.organization_members;

-- Recreate with SECURITY DEFINER function (no recursion)
CREATE POLICY "Owners and managers can manage members"
  ON public.organization_members
  FOR ALL
  TO authenticated
  USING (
    public.user_is_org_owner_or_manager(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
    OR user_id = auth.uid()
  )
  WITH CHECK (
    public.user_is_org_owner_or_manager(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );
