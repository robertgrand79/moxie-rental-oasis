-- onboarding_progress: replace the open INSERT policy and add proper member-scoped policies.
-- Previously the only INSERT policy was qual=true / with_check=true, allowing any authenticated
-- user to insert a row claiming any organization_id. SELECT/UPDATE were restricted to platform
-- admins only, so org owners couldn't see their own onboarding state.

DROP POLICY IF EXISTS "System can insert onboarding progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Org members can view their own onboarding progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Org members can insert their own onboarding progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Org members can update their own onboarding progress" ON public.onboarding_progress;

CREATE POLICY "Org members can view their own onboarding progress"
  ON public.onboarding_progress
  FOR SELECT
  TO authenticated
  USING (
    can_manage_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
  );

CREATE POLICY "Org members can insert their own onboarding progress"
  ON public.onboarding_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    can_manage_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
  );

CREATE POLICY "Org members can update their own onboarding progress"
  ON public.onboarding_progress
  FOR UPDATE
  TO authenticated
  USING (
    can_manage_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    can_manage_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
  );
