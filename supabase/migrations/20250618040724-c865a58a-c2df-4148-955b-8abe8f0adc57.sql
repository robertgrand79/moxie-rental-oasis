
-- Update the UPDATE policy on properties table to allow admins to edit any property
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;

CREATE POLICY "Users can update their own properties or admins can update any" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = created_by OR public.is_admin());
