
-- Allow all authenticated users to read system roles
CREATE POLICY "Authenticated users can view system roles"
ON public.system_roles FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow all authenticated users to read system permissions
CREATE POLICY "Authenticated users can view system permissions"
ON public.system_permissions FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow all authenticated users to read role permissions
CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);
