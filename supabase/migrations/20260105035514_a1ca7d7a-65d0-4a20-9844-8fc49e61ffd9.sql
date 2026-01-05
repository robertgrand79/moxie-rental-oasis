-- Fix security warnings: Set search_path for new functions from Phase 3

-- Fix set_organization_id_from_checklist_run function
CREATE OR REPLACE FUNCTION public.set_organization_id_from_checklist_run()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.run_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM public.property_checklist_runs WHERE id = NEW.run_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Fix set_organization_id_from_seam_device function
CREATE OR REPLACE FUNCTION public.set_organization_id_from_seam_device()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.device_id IS NOT NULL THEN
    SELECT p.organization_id INTO NEW.organization_id
    FROM public.seam_devices sd
    JOIN public.properties p ON p.id = sd.property_id
    WHERE sd.id = NEW.device_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;