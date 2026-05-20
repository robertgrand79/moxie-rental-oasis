-- Reset STACY+CO's spuriously auto-completed branding onboarding step.
--
-- useAutoCompleteOnboarding marked the branding step complete whenever
-- site_settings had a siteName. But siteName is auto-seeded from the
-- org name when the org is created (create_organization_with_owner),
-- so it is always present -- branding auto-completed for every org
-- whose setup wizard was ever opened, before the user uploaded a logo.
--
-- The hook is fixed to require a real logo (siteLogo) instead. This
-- clears the one row that already received the wrong value, so the
-- setup wizard nudges STACY+CO to actually upload a logo.
--
-- Guarded by a no-logo check: idempotent, and a no-op if STACY+CO
-- uploads a logo before this migration runs.

UPDATE organization_onboarding ob
SET completed = false,
    completed_at = NULL
FROM organizations o
WHERE ob.organization_id = o.id
  AND o.name = 'STACY+CO'
  AND ob.step_name = 'branding'
  AND ob.completed = true
  AND NOT EXISTS (
    SELECT 1 FROM site_settings s
    WHERE s.organization_id = ob.organization_id
      AND s.key = 'siteLogo'
      AND s.value IS NOT NULL
      AND s.value::text NOT IN ('""', '')
  );
