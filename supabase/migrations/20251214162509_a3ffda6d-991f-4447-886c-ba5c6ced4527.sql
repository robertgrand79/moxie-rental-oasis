-- Step 1: Create threads from existing reservations (one per unique guest email per organization)
INSERT INTO public.guest_inbox_threads (
  organization_id,
  guest_identifier,
  guest_name,
  guest_email,
  guest_phone,
  status,
  is_read,
  last_message_at,
  last_message_preview,
  created_at
)
SELECT DISTINCT ON (p.organization_id, LOWER(r.guest_email))
  p.organization_id,
  LOWER(r.guest_email) as guest_identifier,
  r.guest_name,
  r.guest_email,
  r.guest_phone,
  'active' as status,
  false as is_read,
  (SELECT MAX(COALESCE(gc.sent_at, gc.created_at)) 
   FROM guest_communications gc 
   WHERE gc.reservation_id = r.id) as last_message_at,
  (SELECT LEFT(gc2.message_content, 100) 
   FROM guest_communications gc2 
   WHERE gc2.reservation_id = r.id 
   ORDER BY COALESCE(gc2.sent_at, gc2.created_at) DESC LIMIT 1) as last_message_preview,
  MIN(r.created_at) OVER (PARTITION BY p.organization_id, LOWER(r.guest_email)) as created_at
FROM property_reservations r
JOIN properties p ON r.property_id = p.id
WHERE r.guest_email IS NOT NULL
ORDER BY p.organization_id, LOWER(r.guest_email), r.created_at DESC;

-- Step 2: Link existing communications to their threads
UPDATE guest_communications gc
SET thread_id = t.id
FROM guest_inbox_threads t
JOIN property_reservations r ON LOWER(r.guest_email) = t.guest_identifier
JOIN properties p ON r.property_id = p.id AND p.organization_id = t.organization_id
WHERE gc.reservation_id = r.id
  AND gc.thread_id IS NULL;