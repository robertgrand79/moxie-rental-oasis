-- Fix get_organization_tier: use subscription_tier directly instead of non-existent template_id join
CREATE OR REPLACE FUNCTION public.get_organization_tier(p_organization_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tier_slug TEXT;
BEGIN
  SELECT subscription_tier INTO tier_slug
  FROM organizations
  WHERE id = p_organization_id;
  
  -- Default to starter if no tier found
  RETURN COALESCE(tier_slug, 'starter');
END;
$function$;