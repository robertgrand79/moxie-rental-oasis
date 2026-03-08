-- Migrate Test Org bookings with COALESCE for nullable fields
ALTER TABLE public.property_reservations DISABLE TRIGGER validate_reservation_insert;
ALTER TABLE public.property_reservations DISABLE TRIGGER on_reservation_created_schedule_messages;

INSERT INTO public.property_reservations (
  id, property_id, guest_name, guest_email, guest_phone,
  check_in_date, check_out_date, guest_count, total_amount,
  booking_status, payment_status, source_platform,
  cleaning_status, currency, organization_id, created_at, updated_at
)
SELECT
  r.id, r.property_id,
  COALESCE(r.guest_name, 'Unknown Guest'),
  COALESCE(r.guest_email, 'guest' || row_number() OVER (ORDER BY r.created_at) || '@test.example.com'),
  r.guest_phone,
  r.check_in_date, r.check_out_date,
  COALESCE(r.guest_count, 1),
  COALESCE(r.total_amount, 0),
  COALESCE(r.booking_status, 'confirmed'),
  COALESCE(r.payment_status, 'pending'),
  COALESCE(r.external_platform, 'direct'),
  'pending', 'USD',
  r.organization_id, r.created_at, r.updated_at
FROM public.reservations r
WHERE r.organization_id = '297f9511-6d14-4fd8-8e5b-373b039b234d'
  AND NOT EXISTS (
    SELECT 1 FROM public.property_reservations pr WHERE pr.id = r.id
  );

ALTER TABLE public.property_reservations ENABLE TRIGGER validate_reservation_insert;
ALTER TABLE public.property_reservations ENABLE TRIGGER on_reservation_created_schedule_messages;