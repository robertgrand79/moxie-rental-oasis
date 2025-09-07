-- Insert sample property reservations to test the calendar timeline
INSERT INTO property_reservations (
  property_id,
  guest_name,
  guest_email,
  check_in_date,
  check_out_date,
  guest_count,
  total_amount,
  booking_status,
  cleaning_status,
  phone,
  special_requests
) VALUES 
(
  'a8a54056-a9e2-4d8e-b3ae-cf059d17f5cb', -- Moxie 10th property ID
  'John Smith',
  'john.smith@email.com',
  '2025-01-10',
  '2025-01-15',
  2,
  750.00,
  'confirmed',
  'scheduled',
  '+1-555-0123',
  'Late check-in requested'
),
(
  'a8a54056-a9e2-4d8e-b3ae-cf059d17f5cb',
  'Sarah Johnson',
  'sarah.j@email.com', 
  '2025-01-18',
  '2025-01-22',
  4,
  1200.00,
  'confirmed',
  'pending',
  '+1-555-0456',
  'Early check-in needed'
),
(
  'a8a54056-a9e2-4d8e-b3ae-cf059d17f5cb',
  'Mike Davis',
  'mike.davis@email.com',
  '2025-01-25',
  '2025-01-28',
  1,
  450.00,
  'pending',
  'not_scheduled',
  '+1-555-0789',
  'Business trip'
);

-- Also insert some availability blocks to simulate external calendar bookings
INSERT INTO availability_blocks (
  property_id,
  block_type,
  start_date,
  end_date,
  notes,
  external_booking_id,
  source_platform,
  guest_count,
  sync_status
) VALUES
(
  'a8a54056-a9e2-4d8e-b3ae-cf059d17f5cb',
  'booked',
  '2025-01-12',
  '2025-01-16',
  'Airbnb Booking - Lisa Chen',
  'HMABCDEF123',
  'airbnb',
  3,
  'synced'
),
(
  'a8a54056-a9e2-4d8e-b3ae-cf059d17f5cb',
  'booked', 
  '2025-01-20',
  '2025-01-24',
  'Airbnb Booking - Robert Wilson',
  'HMGHIJKL456',
  'airbnb',
  2,
  'synced'
);