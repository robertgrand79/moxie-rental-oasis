
-- Fix the function security vulnerability by setting search_path
CREATE OR REPLACE FUNCTION public.update_custom_task_types_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
