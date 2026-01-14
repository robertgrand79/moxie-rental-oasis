-- Add explicit SELECT policies for platform admins on key tables for stats

-- Organizations: Add explicit SELECT policy for platform admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'organizations' 
    AND policyname = 'Platform admins can view all organizations'
  ) THEN
    CREATE POLICY "Platform admins can view all organizations"
      ON public.organizations
      FOR SELECT
      USING (is_platform_admin(auth.uid()));
  END IF;
END $$;

-- Reservations: Add explicit SELECT policy for platform admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reservations' 
    AND policyname = 'Platform admins can view all reservations'
  ) THEN
    CREATE POLICY "Platform admins can view all reservations"
      ON public.reservations
      FOR SELECT
      USING (is_platform_admin(auth.uid()));
  END IF;
END $$;