-- Enable RLS on all sensitive tables and create admin-specific policies

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

-- Fix properties table - enable RLS and allow admin access
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all properties" ON public.properties
FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view published properties" ON public.properties
FOR SELECT USING (true);

-- Fix testimonials table - enable RLS and allow admin access
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all testimonials" ON public.testimonials
FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view published testimonials" ON public.testimonials
FOR SELECT USING (true);

-- Create properties table if it doesn't exist (based on Property interface)
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  bedrooms integer NOT NULL,
  bathrooms integer NOT NULL,
  max_guests integer NOT NULL,
  price_per_night numeric,
  image_url text,
  cover_image_url text,
  images text[],
  featured_photos text[],
  hospitable_booking_url text,
  amenities text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Create testimonials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  property_id uuid,
  guest_avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  status text DEFAULT 'published'
);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fix user invitations table - enable RLS
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

CREATE POLICY "Admins can manage user invitations" ON public.user_invitations
FOR ALL USING (is_admin());