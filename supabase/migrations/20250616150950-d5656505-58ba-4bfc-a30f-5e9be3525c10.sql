
-- Fix Function Search Path Security Warnings
-- Phase 1: Update Trigger Functions

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix update_bookings_updated_at function
CREATE OR REPLACE FUNCTION public.update_bookings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_office_spaces_updated_at function
CREATE OR REPLACE FUNCTION public.update_office_spaces_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix set_work_order_number function
CREATE OR REPLACE FUNCTION public.set_work_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.work_order_number IS NULL OR NEW.work_order_number = '' THEN
    NEW.work_order_number := generate_work_order_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix log_work_order_status_change function
CREATE OR REPLACE FUNCTION public.log_work_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO work_order_status_history (work_order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, NEW.created_by);
  END IF;
  RETURN NEW;
END;
$function$;

-- Phase 2: Update Security Functions

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$;

-- Fix user_has_permission function
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_key text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND (
      role = 'admin' OR 
      (permissions->permission_key)::boolean = true
    )
  );
END;
$function$;

-- Fix can_manage_users function
CREATE OR REPLACE FUNCTION public.can_manage_users()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Simply check if user is admin without referencing profiles table
  RETURN public.is_admin();
END;
$function$;

-- Phase 3: Update Utility Functions

-- Fix generate_work_order_number function
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  work_order_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM work_orders
  WHERE work_order_number LIKE 'WO' || current_year || '%';
  
  work_order_number := 'WO' || current_year || LPAD(next_number::TEXT, 4, '0');
  
  RETURN work_order_number;
END;
$function$;
