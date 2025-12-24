-- Fix profiles with null organization_id by assigning to Moxie Vacation Rentals
-- Both users are already members of Moxie Vacation Rentals in organization_members table
UPDATE public.profiles
SET organization_id = 'a0000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL
  AND id IN (
    'd005af99-e8af-4614-b83f-f84a3e921a70',
    '3957f18c-8c70-4c63-8b9f-75c91a42064a'
  );