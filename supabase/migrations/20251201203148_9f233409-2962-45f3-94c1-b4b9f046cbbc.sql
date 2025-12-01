-- Add policy to allow admins to manage properties (especially those with null organization_id)
CREATE POLICY "Admins can manage all properties"
  ON public.properties
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());