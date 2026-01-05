-- Fix orphaned templates that were created without organization_id
UPDATE maintenance_checklist_templates 
SET organization_id = (
  SELECT organization_id FROM organization_members 
  WHERE user_id = maintenance_checklist_templates.created_by 
  LIMIT 1
)
WHERE organization_id IS NULL 
  AND is_system_template = false
  AND created_by IS NOT NULL;