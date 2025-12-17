-- Add admin INSERT policy for newsletter_subscribers
CREATE POLICY "Admins can insert subscribers"
ON public.newsletter_subscribers
FOR INSERT
TO authenticated
WITH CHECK (is_admin());