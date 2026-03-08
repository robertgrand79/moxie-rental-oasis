-- Temporarily disable validation trigger for bulk data migration
ALTER TABLE public.property_reservations DISABLE TRIGGER validate_reservation_insert;
ALTER TABLE public.property_reservations DISABLE TRIGGER on_reservation_created_schedule_messages;

-- Migrate ONLY Test Org bookings from reservations → property_reservations (idempotent)
INSERT INTO public.property_reservations (
  id, property_id, guest_name, guest_email, guest_phone,
  check_in_date, check_out_date, guest_count, total_amount,
  booking_status, payment_status, stripe_session_id, stripe_payment_intent_id,
  organization_id, special_requests, source_platform,
  cleaning_status, currency, created_at, updated_at
)
SELECT
  r.id, r.property_id,
  COALESCE(r.guest_name, 'Unknown Guest'),
  COALESCE(r.guest_email, 'unknown@example.com'),
  r.guest_phone,
  r.check_in_date, r.check_out_date,
  COALESCE(r.guest_count, 1),
  COALESCE(r.total_amount, 0),
  COALESCE(r.booking_status, 'confirmed'),
  COALESCE(r.payment_status, 'pending'),
  r.stripe_session_id, r.stripe_payment_intent_id,
  r.organization_id, r.special_instructions,
  COALESCE(r.external_platform, 'direct'),
  'pending', 'USD', r.created_at, r.updated_at
FROM public.reservations r
WHERE r.organization_id = '297f9511-6d14-4fd8-8e5b-373b039b234d'
  AND r.guest_name IS NOT NULL
  AND r.guest_email IS NOT NULL
  AND r.total_amount IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.property_reservations pr WHERE pr.id = r.id
  );

-- Re-enable triggers
ALTER TABLE public.property_reservations ENABLE TRIGGER validate_reservation_insert;
ALTER TABLE public.property_reservations ENABLE TRIGGER on_reservation_created_schedule_messages;