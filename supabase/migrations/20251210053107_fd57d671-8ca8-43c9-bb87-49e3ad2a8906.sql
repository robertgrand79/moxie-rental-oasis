-- Add trigger to enforce newsletter subscription validation
-- The function validate_newsletter_subscription already exists

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS validate_newsletter_subscription_trigger ON public.newsletter_subscribers;
CREATE TRIGGER validate_newsletter_subscription_trigger
  BEFORE INSERT ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_newsletter_subscription();