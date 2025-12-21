-- Priority 5 Fixes: Guest profiles audit logging and RLS

-- ============================================
-- GUEST_PROFILES - Add audit logging for admin access
-- ============================================

-- Create an audit trigger function for guest profile access
CREATE OR REPLACE FUNCTION public.audit_guest_profile_select()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if accessed by admin (not the profile owner)
  IF auth.uid() IS NOT NULL AND auth.uid() != NEW.user_id THEN
    INSERT INTO public.admin_audit_logs (
      action,
      table_name,
      record_id,
      admin_id,
      new_values
    ) VALUES (
      'VIEW_GUEST_PROFILE',
      'guest_profiles',
      NEW.id,
      auth.uid(),
      jsonb_build_object('accessed_at', now(), 'guest_email', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- Tighten guest_profiles RLS - ensure users can only see their own
-- ============================================

-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Anyone can view guest profiles" ON public.guest_profiles;
DROP POLICY IF EXISTS "Public can view guest profiles" ON public.guest_profiles;

-- Ensure only the profile owner or admins can view guest profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'guest_profiles' 
    AND policyname = 'Users can view their own guest profile'
  ) THEN
    CREATE POLICY "Users can view their own guest profile"
    ON public.guest_profiles
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'guest_profiles' 
    AND policyname = 'Admins can view all guest profiles'
  ) THEN
    CREATE POLICY "Admins can view all guest profiles"
    ON public.guest_profiles
    FOR SELECT
    USING (public.is_admin());
  END IF;
END $$;