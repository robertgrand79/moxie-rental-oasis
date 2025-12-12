-- Drop the trigger that automatically creates cleaning work orders
DROP TRIGGER IF EXISTS auto_create_cleaning_work_order ON property_reservations;

-- Drop the function since it's no longer needed
DROP FUNCTION IF EXISTS public.create_cleaning_work_order();