-- Enable RLS on existing tables and create admin-specific policies

-- Fix profiles table - ensure admin can manage all profiles  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (is_admin());

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id OR is_admin())
WITH CHECK (auth.uid() = id OR is_admin());

-- Enable RLS on properties table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
        DROP POLICY IF EXISTS "Anyone can view published properties" ON public.properties;
        
        CREATE POLICY "Admins can manage all properties" ON public.properties
        FOR ALL USING (is_admin());
        
        CREATE POLICY "Anyone can view published properties" ON public.properties
        FOR SELECT USING (true);
    END IF;
END $$;

-- Enable RLS on testimonials table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials' AND table_schema = 'public') THEN
        ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admins can manage all testimonials" ON public.testimonials;
        DROP POLICY IF EXISTS "Anyone can view published testimonials" ON public.testimonials;
        
        CREATE POLICY "Admins can manage all testimonials" ON public.testimonials
        FOR ALL USING (is_admin());
        
        CREATE POLICY "Anyone can view published testimonials" ON public.testimonials
        FOR SELECT USING (true);
    END IF;
END $$;

-- Create user invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  full_name text,
  invited_by uuid,
  status text DEFAULT 'pending',
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage user invitations" ON public.user_invitations;
CREATE POLICY "Admins can manage user invitations" ON public.user_invitations
FOR ALL USING (is_admin());