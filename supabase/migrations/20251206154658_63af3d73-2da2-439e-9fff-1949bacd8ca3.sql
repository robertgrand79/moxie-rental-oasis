-- Update the trigger to use NULL instead of placeholder UUID for public bookings
CREATE OR REPLACE FUNCTION public.create_cleaning_work_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cleaning_contractor_id UUID;
  new_work_order_id UUID;
BEGIN
  -- Only create work order for confirmed bookings
  IF NEW.booking_status = 'confirmed' AND (OLD IS NULL OR OLD.booking_status != 'confirmed') THEN
    
    -- Find a cleaning contractor
    SELECT id INTO cleaning_contractor_id 
    FROM contractors 
    WHERE 'cleaning' = ANY(specialties) 
    AND is_active = true 
    LIMIT 1;

    -- Create work order for cleaning with valid status 'draft'
    -- Use NULL for created_by when no authenticated user (public bookings)
    INSERT INTO work_orders (
      property_id,
      title,
      description,
      priority,
      contractor_id,
      created_by,
      status
    ) VALUES (
      NEW.property_id,
      'Turnover Cleaning - ' || NEW.guest_name,
      'Clean property between guests. Check-out: ' || NEW.check_out_date || ', Check-in: ' || NEW.check_in_date,
      'high',
      cleaning_contractor_id,
      auth.uid(),  -- Will be NULL for public bookings
      'draft'
    ) RETURNING id INTO new_work_order_id;

    -- Update reservation with work order ID
    NEW.cleaning_work_order_id = new_work_order_id;
    NEW.cleaning_status = 'scheduled';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Make created_by nullable on work_orders if it has a NOT NULL constraint
ALTER TABLE work_orders ALTER COLUMN created_by DROP NOT NULL;