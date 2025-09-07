-- Clean up duplicate reservations and availability blocks
DELETE FROM property_reservations 
WHERE id NOT IN (
  SELECT DISTINCT ON (guest_name, check_in_date, check_out_date) id 
  FROM property_reservations 
  WHERE property_id = 'a8a54056-a9e2-4d8e-b3ae-cf059d17f5cb'
  ORDER BY guest_name, check_in_date, check_out_date, created_at
);

DELETE FROM availability_blocks 
WHERE id NOT IN (
  SELECT DISTINCT ON (notes, start_date, end_date) id 
  FROM availability_blocks 
  WHERE property_id = 'a8a54056-a9e2-4d8e-b3ae-cf059d17f5cb'
  ORDER BY notes, start_date, end_date, created_at
);