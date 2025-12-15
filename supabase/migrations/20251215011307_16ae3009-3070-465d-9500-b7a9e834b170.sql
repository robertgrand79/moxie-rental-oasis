-- Make reservation_id nullable in guest_communications to allow messages without reservations
ALTER TABLE public.guest_communications 
ALTER COLUMN reservation_id DROP NOT NULL;

-- Update RLS policy to allow inserts when thread_id is provided (even without reservation_id)
DROP POLICY IF EXISTS "Users can insert communications for their reservations" ON public.guest_communications;

CREATE POLICY "Users can insert communications with thread or reservation" 
ON public.guest_communications 
FOR INSERT 
WITH CHECK (
  -- Allow if reservation belongs to user's org
  (reservation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.property_reservations pr
    JOIN public.properties p ON pr.property_id = p.id
    JOIN public.organization_members om ON om.organization_id = p.organization_id
    WHERE pr.id = reservation_id AND om.user_id = auth.uid()
  ))
  OR
  -- Allow if thread belongs to user's org
  (thread_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.guest_inbox_threads t
    JOIN public.organization_members om ON om.organization_id = t.organization_id
    WHERE t.id = thread_id AND om.user_id = auth.uid()
  ))
  OR
  -- Allow service role (edge functions)
  auth.role() = 'service_role'
);