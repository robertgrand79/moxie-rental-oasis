-- Delete orphaned message_templates with no organization scope
DELETE FROM message_templates 
WHERE organization_id IS NULL 
  AND property_id IS NULL 
  AND created_by IS NULL;

-- Delete orphaned messaging_rules with no organization scope
DELETE FROM messaging_rules 
WHERE organization_id IS NULL 
  AND property_id IS NULL 
  AND created_by IS NULL;