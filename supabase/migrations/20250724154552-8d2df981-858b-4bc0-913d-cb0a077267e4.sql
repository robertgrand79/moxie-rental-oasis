CREATE OR REPLACE FUNCTION public.validate_blog_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check content length
  IF length(NEW.content) > 100000 THEN
    RAISE EXCEPTION 'Content too long. Maximum 100,000 characters allowed.';
  END IF;
  
  -- Check for suspicious patterns
  IF NEW.content ~* '<script|javascript:|data:text/html|<iframe|<object|<embed' THEN
    RAISE EXCEPTION 'Content contains potentially dangerous HTML.';
  END IF;
  
  RETURN NEW;
END;
$function$