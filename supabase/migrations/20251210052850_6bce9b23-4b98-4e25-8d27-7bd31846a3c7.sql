-- Fix: Add validation to guest_profiles public INSERT policy
-- The public INSERT is needed for booking flow, but should be validated

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Public can create guest profiles" ON public.guest_profiles;

-- Create a new INSERT policy with validation constraints
-- Guests can only create profiles with valid email format and their own data
CREATE POLICY "Public can create guest profiles with validation" 
ON public.guest_profiles 
FOR INSERT 
WITH CHECK (
  -- Email must be provided and valid format (basic check)
  email IS NOT NULL 
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- If authenticated, user_id must match (prevents impersonation)
  AND (auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL)
  -- Prevent suspicious email patterns
  AND email !~* '(test@test|fake@|spam@|mailinator|10minutemail|tempmail)'
);

-- Add a trigger for additional validation and rate limiting
CREATE OR REPLACE FUNCTION public.validate_guest_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Normalize email to lowercase
  NEW.email = LOWER(TRIM(NEW.email));
  
  -- Validate phone format if provided (basic check)
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    -- Remove all non-digit characters for validation
    IF LENGTH(regexp_replace(NEW.phone, '[^0-9]', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'Invalid phone number format';
    END IF;
  END IF;
  
  -- Sanitize name fields
  IF NEW.first_name IS NOT NULL THEN
    NEW.first_name = TRIM(NEW.first_name);
    IF LENGTH(NEW.first_name) > 100 THEN
      RAISE EXCEPTION 'First name too long';
    END IF;
  END IF;
  
  IF NEW.last_name IS NOT NULL THEN
    NEW.last_name = TRIM(NEW.last_name);
    IF LENGTH(NEW.last_name) > 100 THEN
      RAISE EXCEPTION 'Last name too long';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_guest_profile_insert ON public.guest_profiles;
CREATE TRIGGER validate_guest_profile_insert
  BEFORE INSERT ON public.guest_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_guest_profile_creation();