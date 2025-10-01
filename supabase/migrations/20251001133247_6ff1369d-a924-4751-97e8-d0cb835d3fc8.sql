
-- Fix testimonials table RLS policies to protect guest personal information
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view published testimonials" ON public.testimonials;

-- Keep the existing "Anyone can view active testimonials" policy
-- but ensure it's the primary public access control

-- Ensure the policy properly restricts to only active and published testimonials
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;

CREATE POLICY "Public can view approved testimonials only"
ON public.testimonials
FOR SELECT
TO public
USING (
  is_active = true 
  AND (status IS NULL OR status = 'published')
);

-- Keep admin policies intact (already restrictive enough)
-- Admins can manage all testimonials
-- No changes needed to admin policies as they are already secure
