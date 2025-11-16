-- Phase 1: Database Schema Fix
-- Step 1: Add missing columns to property_reservations that exist in reservations
ALTER TABLE property_reservations ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE property_reservations ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Step 2: Migrate existing data from reservations to property_reservations
-- Only migrate records with valid guest information
INSERT INTO property_reservations (
  id,
  property_id,
  guest_name,
  guest_email,
  guest_phone,
  check_in_date,
  check_out_date,
  guest_count,
  total_amount,
  booking_status,
  source_platform,
  special_requests,
  payment_status,
  stripe_session_id,
  stripe_payment_intent_id,
  created_at,
  updated_at
)
SELECT 
  id,
  property_id,
  COALESCE(guest_name, 'Guest'),
  COALESCE(guest_email, 'no-email@example.com'),
  guest_phone,
  check_in_date,
  check_out_date,
  total_guests,
  COALESCE(total_amount, 0),
  status,
  COALESCE(external_platform, 'direct'),
  special_instructions,
  COALESCE(payment_status, 'pending'),
  NULL, -- stripe_session_id doesn't exist yet in reservations
  stripe_payment_intent_id,
  created_at,
  updated_at
FROM reservations
WHERE id NOT IN (SELECT id FROM property_reservations)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update reservations table schema to match property_reservations naming
-- Add stripe_session_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' 
    AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE reservations ADD COLUMN stripe_session_id text;
  END IF;
END $$;

-- Rename columns in reservations table
ALTER TABLE reservations RENAME COLUMN status TO booking_status;
ALTER TABLE reservations RENAME COLUMN total_guests TO guest_count;