-- Drop and recreate the cleaning work order trigger function without the 'category' column
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

    -- Create work order for cleaning (removed 'category' column which doesn't exist)
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
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'pending'
    ) RETURNING id INTO new_work_order_id;

    -- Update reservation with work order ID
    NEW.cleaning_work_order_id = new_work_order_id;
    NEW.cleaning_status = 'scheduled';
  END IF;
  
  RETURN NEW;
END;
$function$;