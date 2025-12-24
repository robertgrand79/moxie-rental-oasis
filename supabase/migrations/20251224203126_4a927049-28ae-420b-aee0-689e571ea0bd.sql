-- Fix contractors with null organization_id by assigning to Moxie Vacation Rentals
UPDATE public.contractors
SET organization_id = 'a0000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL
  AND id IN (
    '4e0787c6-2123-4b8e-b4f7-513280980bc0',
    '59e7524d-ac21-4147-bd90-cc726bc9a12d'
  );