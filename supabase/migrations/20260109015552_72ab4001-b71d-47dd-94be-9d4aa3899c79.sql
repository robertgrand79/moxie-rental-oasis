-- Allow platform admins to add themselves to any organization
CREATE POLICY "Platform admins can add themselves to organizations"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid()) 
  AND user_id = auth.uid()
);