-- Create a security definer function to get the current user's role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role, 'user')
  FROM public.profiles
  WHERE id = auth.uid()
$$;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Drop the old problematic policy
DROP POLICY IF EXISTS "Users can update their own profile securely" ON public.profiles;

-- Create a new policy without recursion
-- Admins can update any profile, users can only update their own profile (except role)
CREATE POLICY "Users can update own profile admins can update all"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id 
  OR public.current_user_is_admin() 
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  -- Users updating their own profile cannot change their role
  (auth.uid() = id AND role = public.get_current_user_role())
  -- Admins and platform admins can change any field including role
  OR public.current_user_is_admin()
  OR public.is_platform_admin(auth.uid())
);