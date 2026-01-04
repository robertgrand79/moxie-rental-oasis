-- Fix RLS policies for property_checklist_runs to allow org members access
DROP POLICY IF EXISTS "Admins can manage checklist runs" ON property_checklist_runs;

-- Create SELECT policy - users can view runs for properties in their org
CREATE POLICY "Users can view checklist runs for their org properties"
ON property_checklist_runs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_checklist_runs.property_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
  OR public.is_admin()
);

-- Create INSERT policy
CREATE POLICY "Users can create checklist runs for their org properties"
ON property_checklist_runs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_checklist_runs.property_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
  OR public.is_admin()
);

-- Create UPDATE policy
CREATE POLICY "Users can update checklist runs for their org properties"
ON property_checklist_runs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_checklist_runs.property_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
  OR public.is_admin()
);

-- Create DELETE policy
CREATE POLICY "Users can delete checklist runs for their org properties"
ON property_checklist_runs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_checklist_runs.property_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
  OR public.is_admin()
);

-- Fix RLS policies for property_checklist_item_completions
DROP POLICY IF EXISTS "Admins can manage checklist completions" ON property_checklist_item_completions;

-- Create SELECT policy
CREATE POLICY "Users can view checklist completions for their org"
ON property_checklist_item_completions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM property_checklist_runs r
    JOIN properties p ON p.id = r.property_id
    WHERE r.id = property_checklist_item_completions.run_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
  OR public.is_admin()
);

-- Create INSERT policy
CREATE POLICY "Users can create checklist completions for their org"
ON property_checklist_item_completions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM property_checklist_runs r
    JOIN properties p ON p.id = r.property_id
    WHERE r.id = property_checklist_item_completions.run_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
  OR public.is_admin()
);

-- Create UPDATE policy
CREATE POLICY "Users can update checklist completions for their org"
ON property_checklist_item_completions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM property_checklist_runs r
    JOIN properties p ON p.id = r.property_id
    WHERE r.id = property_checklist_item_completions.run_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
  OR public.is_admin()
);

-- Create DELETE policy
CREATE POLICY "Users can delete checklist completions for their org"
ON property_checklist_item_completions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM property_checklist_runs r
    JOIN properties p ON p.id = r.property_id
    WHERE r.id = property_checklist_item_completions.run_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
  OR public.is_admin()
);