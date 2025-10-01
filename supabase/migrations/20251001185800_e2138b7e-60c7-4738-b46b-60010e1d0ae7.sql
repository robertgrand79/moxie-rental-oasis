-- Fix profiles table RLS policies to protect customer personal data
-- This migration cleans up redundant policies and ensures proper authentication

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles (role-safe)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Users can securely update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create clean, secure policies with proper authentication checks

-- SELECT: Users can only view their own profile, admins can view all
CREATE POLICY "Users can view their own profile securely"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR is_admin()
);

-- INSERT: Only allow profile creation by the user themselves
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
);

-- UPDATE: Users can update own profile (except role), admins can update any profile
CREATE POLICY "Users can update their own profile securely"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR is_admin()
)
WITH CHECK (
  (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  OR 
  (is_admin() AND can_update_user_role(id, 'unused'::text, COALESCE(role, 'user'::text)))
);

-- DELETE: Only admins can delete profiles (prevents users from deleting their own accounts without proper cleanup)
CREATE POLICY "Only admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  is_admin()
);

-- Add comment explaining the security model
COMMENT ON TABLE public.profiles IS 'User profile information - contains PII (emails, phone numbers, names). RLS policies ensure users can only access their own data unless they are admins.';
