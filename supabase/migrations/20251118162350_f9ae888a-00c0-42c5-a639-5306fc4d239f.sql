-- Fix security warning: Add SET search_path to update_organizations_updated_at function
CREATE OR REPLACE FUNCTION public.update_organizations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;