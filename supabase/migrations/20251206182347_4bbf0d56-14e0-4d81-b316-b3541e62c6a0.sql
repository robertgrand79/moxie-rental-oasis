-- Create availability blocks for existing paid direct bookings that don't have them
INSERT INTO availability_blocks (property_id, start_date, end_date, block_type, source_platform, external_booking_id, notes, sync_status)
SELECT 
  pr.property_id,
  pr.check_in_date,
  pr.check_out_date,
  'booked',
  'direct',
  pr.id::text,
  'Direct Booking - ' || pr.guest_name,
  'synced'
FROM property_reservations pr
WHERE pr.payment_status = 'paid' 
AND NOT EXISTS (
  SELECT 1 FROM availability_blocks ab 
  WHERE ab.external_booking_id = pr.id::text
);