-- Allow platform admins to manage ALL organizations
DROP POLICY IF EXISTS "Platform admins can manage all organizations" ON public.organizations;
CREATE POLICY "Platform admins can manage all organizations"
ON public.organizations
FOR ALL
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Also add SELECT policy for platform admins to see inactive orgs
DROP POLICY IF EXISTS "Platform admins can view all organizations" ON public.organizations;
CREATE POLICY "Platform admins can view all organizations"
ON public.organizations
FOR SELECT
USING (public.is_platform_admin(auth.uid()));