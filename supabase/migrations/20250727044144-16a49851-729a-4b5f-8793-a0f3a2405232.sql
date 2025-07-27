-- Fix security warning: Set immutable search_path for turno_sync_properties function
CREATE OR REPLACE FUNCTION public.turno_sync_properties()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This is just a placeholder function for the edge function endpoint
  -- The actual work is done in the edge function
  RAISE NOTICE 'Properties sync endpoint available at /turno-sync/properties';
END;
$function$;