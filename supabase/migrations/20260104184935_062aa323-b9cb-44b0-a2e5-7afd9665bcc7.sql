
-- Fix RLS policy for maintenance_checklist_items to allow users to insert items
-- The existing policy requires org membership but templates might not have org_id set yet

DROP POLICY IF EXISTS "Users can manage items in their org templates" ON maintenance_checklist_items;

-- Create separate policies for better control

-- SELECT policy already exists and is good

-- INSERT policy - allow if user owns the template OR is in the org
CREATE POLICY "Users can insert items in their templates"
ON maintenance_checklist_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM maintenance_checklist_templates t
    WHERE t.id = maintenance_checklist_items.template_id
    AND (
      t.created_by = auth.uid()
      OR (t.organization_id IS NOT NULL AND public.user_belongs_to_organization(auth.uid(), t.organization_id))
    )
  )
  OR public.is_admin()
);

-- UPDATE policy - allow if user owns the template OR is in the org
CREATE POLICY "Users can update items in their templates"
ON maintenance_checklist_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM maintenance_checklist_templates t
    WHERE t.id = maintenance_checklist_items.template_id
    AND (
      t.created_by = auth.uid()
      OR (t.organization_id IS NOT NULL AND public.user_belongs_to_organization(auth.uid(), t.organization_id))
    )
  )
  OR public.is_admin()
);

-- DELETE policy - allow if user owns the template OR is in the org
CREATE POLICY "Users can delete items in their templates"
ON maintenance_checklist_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM maintenance_checklist_templates t
    WHERE t.id = maintenance_checklist_items.template_id
    AND (
      t.created_by = auth.uid()
      OR (t.organization_id IS NOT NULL AND public.user_belongs_to_organization(auth.uid(), t.organization_id))
    )
  )
  OR public.is_admin()
);