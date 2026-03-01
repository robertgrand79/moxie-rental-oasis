-- Fix the initialize_onboarding_progress trigger function
-- The organizations table has no owner_id column, use auth.uid() instead

CREATE OR REPLACE FUNCTION public.initialize_onboarding_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.onboarding_progress (
    organization_id,
    user_id,
    current_stage,
    stage_history
  ) VALUES (
    NEW.id,
    auth.uid(),
    'org_created',
    jsonb_build_array(jsonb_build_object('stage', 'org_created', 'at', now()))
  )
  ON CONFLICT (organization_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;