-- Fix guest_communications RLS policies to require authentication

DROP POLICY IF EXISTS "Organization admins can manage guest communications" ON public.guest_communications;
DROP POLICY IF EXISTS "Users can insert communications with thread or reservation" ON public.guest_communications;
DROP POLICY IF EXISTS "Organization members can view guest communications" ON public.guest_communications;
DROP POLICY IF EXISTS "View communications by thread organization" ON public.guest_communications;

-- Recreate with authenticated role

CREATE POLICY "Organization admins can manage guest communications"
ON public.guest_communications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM property_reservations pr
    WHERE pr.id = guest_communications.reservation_id 
    AND can_manage_property(auth.uid(), pr.property_id)
  )
);

CREATE POLICY "Organization members can insert communications"
ON public.guest_communications
FOR INSERT
TO authenticated
WITH CHECK (
  (reservation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM property_reservations pr
    JOIN properties p ON pr.property_id = p.id
    JOIN organization_members om ON om.organization_id = p.organization_id
    WHERE pr.id = guest_communications.reservation_id 
    AND om.user_id = auth.uid()
  ))
  OR
  (thread_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM guest_inbox_threads t
    JOIN organization_members om ON om.organization_id = t.organization_id
    WHERE t.id = guest_communications.thread_id 
    AND om.user_id = auth.uid()
  ))
);

CREATE POLICY "Organization members can view communications by reservation"
ON public.guest_communications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM property_reservations pr
    WHERE pr.id = guest_communications.reservation_id 
    AND can_access_property(auth.uid(), pr.property_id)
  )
);

CREATE POLICY "Organization members can view communications by thread"
ON public.guest_communications
FOR SELECT
TO authenticated
USING (
  thread_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM guest_inbox_threads t
    WHERE t.id = guest_communications.thread_id 
    AND user_belongs_to_organization(auth.uid(), t.organization_id)
  )
);

-- Service role for edge functions
CREATE POLICY "Service role can manage communications"
ON public.guest_communications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);