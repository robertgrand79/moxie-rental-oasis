-- Add archive columns to support_tickets
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

-- Add archive columns to user_feedback
ALTER TABLE public.user_feedback 
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

-- Add DELETE policy for platform admins on support_tickets
CREATE POLICY "Platform admins can delete tickets" 
ON public.support_tickets 
FOR DELETE 
USING (public.is_platform_admin(auth.uid()));

-- Add UPDATE policy for platform admins on support_tickets
CREATE POLICY "Platform admins can update tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (public.is_platform_admin(auth.uid()));

-- Add SELECT policy for platform admins on support_tickets
CREATE POLICY "Platform admins can view all tickets" 
ON public.support_tickets 
FOR SELECT 
USING (public.is_platform_admin(auth.uid()));

-- Add DELETE policy for platform admins on user_feedback
CREATE POLICY "Platform admins can delete feedback" 
ON public.user_feedback 
FOR DELETE 
USING (public.is_platform_admin(auth.uid()));