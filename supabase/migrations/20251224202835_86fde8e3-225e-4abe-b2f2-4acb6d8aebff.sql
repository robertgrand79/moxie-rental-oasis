-- Fix work orders with null organization_id by linking them to their property's organization
UPDATE public.work_orders wo
SET organization_id = p.organization_id
FROM public.properties p
WHERE wo.property_id = p.id
  AND wo.organization_id IS NULL
  AND p.organization_id IS NOT NULL;