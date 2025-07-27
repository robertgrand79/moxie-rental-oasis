-- Add properties endpoint to the turno-sync function
CREATE OR REPLACE FUNCTION turno_sync_properties()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is just a placeholder function for the edge function endpoint
  -- The actual work is done in the edge function
  RAISE NOTICE 'Properties sync endpoint available at /turno-sync/properties';
END;
$$;