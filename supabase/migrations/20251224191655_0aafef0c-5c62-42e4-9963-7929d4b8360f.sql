-- Add UPDATE policy for platform admins on user_feedback table
CREATE POLICY "Platform admins can update feedback" 
ON public.user_feedback 
FOR UPDATE 
USING (public.is_platform_admin(auth.uid()));

-- Also add SELECT policy for platform admins to view all feedback
CREATE POLICY "Platform admins can view all feedback" 
ON public.user_feedback 
FOR SELECT 
USING (public.is_platform_admin(auth.uid()));