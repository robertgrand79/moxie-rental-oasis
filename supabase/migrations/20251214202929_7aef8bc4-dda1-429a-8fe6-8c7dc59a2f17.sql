-- Allow viewing communications via thread membership (organization-scoped)
-- This fixes the issue where messages don't show after logout/refresh
-- when reservations may be missing or deleted

CREATE POLICY "View communications by thread organization"
ON public.guest_communications
FOR SELECT
USING (
  thread_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM guest_inbox_threads t
    WHERE t.id = guest_communications.thread_id
    AND user_belongs_to_organization(auth.uid(), t.organization_id)
  )
);