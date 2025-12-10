-- Enhance property_reservations INSERT validation with server-side trigger
-- Adds rate limiting, input sanitization, and anti-abuse measures

CREATE OR REPLACE FUNCTION public.validate_reservation_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Normalize email to lowercase
  NEW.guest_email = LOWER(TRIM(NEW.guest_email));
  
  -- Sanitize guest name
  NEW.guest_name = TRIM(NEW.guest_name);
  
  -- Validate name length
  IF LENGTH(NEW.guest_name) > 200 THEN
    RAISE EXCEPTION 'Guest name too long';
  END IF;
  
  -- Block suspicious email patterns
  IF NEW.guest_email ~* '(mailinator|10minutemail|tempmail|guerrillamail|throwaway|fakeinbox)' THEN
    RAISE EXCEPTION 'Disposable email addresses not allowed';
  END IF;
  
  -- Validate phone format if provided
  IF NEW.guest_phone IS NOT NULL AND NEW.guest_phone != '' THEN
    NEW.guest_phone = TRIM(NEW.guest_phone);
    IF LENGTH(regexp_replace(NEW.guest_phone, '[^0-9]', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'Invalid phone number format';
    END IF;
  END IF;
  
  -- Validate dates
  IF NEW.check_in_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Check-in date cannot be in the past';
  END IF;
  
  IF NEW.check_out_date <= NEW.check_in_date THEN
    RAISE EXCEPTION 'Check-out date must be after check-in date';
  END IF;
  
  -- Validate guest count
  IF NEW.guest_count < 1 OR NEW.guest_count > 50 THEN
    RAISE EXCEPTION 'Invalid guest count';
  END IF;
  
  -- Rate limiting: max 5 reservations per email per hour
  SELECT COUNT(*) INTO recent_count
  FROM public.property_reservations
  WHERE guest_email = NEW.guest_email
    AND created_at > NOW() - INTERVAL '1 hour';
    
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many reservation attempts. Please try again later.';
  END IF;
  
  -- Rate limiting: max 10 reservations per property per hour (anti-scraping)
  SELECT COUNT(*) INTO recent_count
  FROM public.property_reservations
  WHERE property_id = NEW.property_id
    AND created_at > NOW() - INTERVAL '1 hour';
    
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'This property has too many pending reservations. Please try again later.';
  END IF;
  
  -- Set defaults
  NEW.booking_status = COALESCE(NEW.booking_status, 'pending');
  NEW.source_platform = COALESCE(NEW.source_platform, 'direct');
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_reservation_insert ON public.property_reservations;
CREATE TRIGGER validate_reservation_insert
  BEFORE INSERT ON public.property_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_reservation_creation();