-- Fix work_orders RLS: Remove dangerous USING(true) policies

-- ============================================
-- DROP DANGEROUS PERMISSIVE POLICIES
-- ============================================

-- These policies allow ANY authenticated user to delete/update ANY work order
DROP POLICY IF EXISTS "Users can delete work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Users can update work orders" ON public.work_orders;

-- ============================================
-- DROP REDUNDANT SELECT POLICIES (consolidate to cleaner set)
-- ============================================

-- Keep only the well-scoped policies, drop overlapping ones
DROP POLICY IF EXISTS "Users can view work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Users can view their work orders" ON public.work_orders;

-- ============================================
-- ENSURE PROPER POLICIES EXIST
-- ============================================

-- Contractors can view work orders assigned to them (via token access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'work_orders' 
    AND policyname = 'Contractors can view assigned work orders'
  ) THEN
    CREATE POLICY "Contractors can view assigned work orders"
    ON public.work_orders
    FOR SELECT
    USING (
      contractor_id IN (
        SELECT c.id FROM public.contractors c
        WHERE c.id = work_orders.contractor_id
      )
    );
  END IF;
END $$;

-- Ensure organization-scoped update policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'work_orders' 
    AND policyname = 'Organization members can update work orders'
  ) THEN
    CREATE POLICY "Organization members can update work orders"
    ON public.work_orders
    FOR UPDATE
    USING (
      user_belongs_to_organization(auth.uid(), organization_id)
    );
  END IF;
END $$;

-- Ensure organization-scoped delete policy exists (only admins)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'work_orders' 
    AND policyname = 'Organization admins can delete work orders'
  ) THEN
    CREATE POLICY "Organization admins can delete work orders"
    ON public.work_orders
    FOR DELETE
    USING (
      user_is_org_admin(auth.uid(), organization_id)
    );
  END IF;
END $$;