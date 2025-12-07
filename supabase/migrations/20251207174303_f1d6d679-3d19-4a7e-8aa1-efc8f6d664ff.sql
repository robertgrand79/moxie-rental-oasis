-- Fix the remaining function search_path warning
CREATE OR REPLACE FUNCTION public.create_reservation_with_lock(
  p_property_id uuid, 
  p_check_in date, 
  p_check_out date, 
  p_guest_name text, 
  p_guest_email text, 
  p_guest_phone text, 
  p_guest_count integer, 
  p_total_amount numeric, 
  p_payment_status text, 
  p_stripe_session_id text
)
RETURNS json
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  v_reservation_id UUID;
  v_conflict_count INTEGER;
BEGIN
  -- Lock the property row
  PERFORM * FROM properties WHERE id = p_property_id FOR UPDATE;
  
  -- Check for conflicts
  SELECT COUNT(*) INTO v_conflict_count
  FROM availability_blocks
  WHERE property_id = p_property_id
  AND block_type = 'booked'
  AND (
    (start_date >= p_check_in AND start_date < p_check_out)
    OR (end_date > p_check_in AND end_date <= p_check_out)
    OR (start_date <= p_check_in AND end_date >= p_check_out)
  );
  
  IF v_conflict_count > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Property is not available for selected dates'
    );
  END IF;
  
  -- Create reservation
  INSERT INTO reservations (
    property_id,
    guest_name,
    guest_email,
    guest_phone,
    check_in_date,
    check_out_date,
    guest_count,
    total_amount,
    payment_status,
    booking_status,
    source_platform,
    stripe_session_id
  ) VALUES (
    p_property_id,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_check_in,
    p_check_out,
    p_guest_count,
    p_total_amount,
    p_payment_status,
    'confirmed',
    'direct',
    p_stripe_session_id
  )
  RETURNING id INTO v_reservation_id;
  
  -- Create availability block
  INSERT INTO availability_blocks (
    property_id,
    start_date,
    end_date,
    block_type,
    source_platform,
    notes
  ) VALUES (
    p_property_id,
    p_check_in,
    p_check_out,
    'booked',
    'direct',
    'Direct Booking'
  );
  
  RETURN json_build_object(
    'success', true,
    'reservation_id', v_reservation_id
  );
END;
$function$;