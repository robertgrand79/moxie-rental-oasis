-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage templates in their organization" ON public.maintenance_checklist_templates;
DROP POLICY IF EXISTS "Users can view system templates or their org templates" ON public.maintenance_checklist_templates;

-- Create new policies that allow templates without organization
CREATE POLICY "Users can view templates" 
ON public.maintenance_checklist_templates 
FOR SELECT 
USING (
  is_system_template = true 
  OR organization_id IS NULL 
  OR user_belongs_to_organization(auth.uid(), organization_id)
);

CREATE POLICY "Authenticated users can create templates" 
ON public.maintenance_checklist_templates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own templates" 
ON public.maintenance_checklist_templates 
FOR UPDATE 
USING (
  created_by = auth.uid() 
  OR (organization_id IS NOT NULL AND user_belongs_to_organization(auth.uid(), organization_id))
);

CREATE POLICY "Users can delete their own templates" 
ON public.maintenance_checklist_templates 
FOR DELETE 
USING (
  created_by = auth.uid() 
  OR (organization_id IS NOT NULL AND user_belongs_to_organization(auth.uid(), organization_id))
);