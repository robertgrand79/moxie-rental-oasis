-- Fix orphaned properties by assigning them to the correct organization
-- This updates properties that have NULL organization_id based on their creator's organization membership

UPDATE properties p
SET organization_id = om.organization_id
FROM organization_members om
WHERE p.organization_id IS NULL 
  AND p.created_by = om.user_id
  AND om.organization_id IS NOT NULL;