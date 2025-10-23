-- Drop the view that depends on hospitable_booking_url
DROP VIEW IF EXISTS property_listings CASCADE;

-- Remove Hospitable booking URL from properties
ALTER TABLE properties DROP COLUMN IF EXISTS hospitable_booking_url CASCADE;

-- Add tax-related fields to properties
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS cleaning_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_fee_percentage NUMERIC(5,2) DEFAULT 0;

-- Tax Rates Table
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction TEXT NOT NULL,
  jurisdiction_type TEXT NOT NULL CHECK (jurisdiction_type IN ('city', 'county', 'state')),
  tax_name TEXT NOT NULL,
  tax_rate NUMERIC(5,4) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Tax Assignments Table
CREATE TABLE IF NOT EXISTS property_tax_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tax_rate_id UUID NOT NULL REFERENCES tax_rates(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, tax_rate_id)
);

-- Booking Charges Table (detailed breakdown)
CREATE TABLE IF NOT EXISTS booking_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  charge_type TEXT NOT NULL CHECK (charge_type IN ('accommodation', 'cleaning_fee', 'service_fee', 'tax')),
  charge_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  tax_rate_id UUID REFERENCES tax_rates(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for tax_rates
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active tax rates" ON tax_rates;
CREATE POLICY "Public can view active tax rates"
  ON tax_rates FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage tax rates" ON tax_rates;
CREATE POLICY "Admins can manage tax rates"
  ON tax_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for property_tax_assignments
ALTER TABLE property_tax_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active tax assignments" ON property_tax_assignments;
CREATE POLICY "Public can view active tax assignments"
  ON property_tax_assignments FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage tax assignments" ON property_tax_assignments;
CREATE POLICY "Admins can manage tax assignments"
  ON property_tax_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for booking_charges
ALTER TABLE booking_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guests can view their booking charges" ON booking_charges;
CREATE POLICY "Guests can view their booking charges"
  ON booking_charges FOR SELECT
  USING (
    reservation_id IN (
      SELECT id FROM reservations 
      WHERE guest_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage all booking charges" ON booking_charges;
CREATE POLICY "Admins can manage all booking charges"
  ON booking_charges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tax_rates_updated_at ON tax_rates;
CREATE TRIGGER update_tax_rates_updated_at BEFORE UPDATE ON tax_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_tax_assignments_updated_at ON property_tax_assignments;
CREATE TRIGGER update_property_tax_assignments_updated_at BEFORE UPDATE ON property_tax_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Eugene tax data
INSERT INTO tax_rates (jurisdiction, jurisdiction_type, tax_name, tax_rate, effective_from)
VALUES 
  ('Eugene', 'city', 'Lodging Tax', 0.0950, '2024-01-01'),
  ('Lane County', 'county', 'Tourism Tax', 0.0200, '2024-01-01')
ON CONFLICT DO NOTHING;

-- Set Eugene as default city for existing properties
UPDATE properties SET city = 'Eugene' WHERE city IS NULL;

-- Auto-assign Eugene taxes to Eugene properties
INSERT INTO property_tax_assignments (property_id, tax_rate_id)
SELECT p.id, t.id
FROM properties p, tax_rates t
WHERE p.city = 'Eugene' AND t.jurisdiction IN ('Eugene', 'Lane County')
ON CONFLICT (property_id, tax_rate_id) DO NOTHING;

-- Create atomic reservation function with locking
CREATE OR REPLACE FUNCTION create_reservation_with_lock(
  p_property_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_guest_name TEXT,
  p_guest_email TEXT,
  p_guest_phone TEXT,
  p_guest_count INTEGER,
  p_total_amount NUMERIC,
  p_payment_status TEXT,
  p_stripe_session_id TEXT
)
RETURNS JSON AS $$
DECLARE
  v_reservation_id UUID;
  v_conflict_count INTEGER;
BEGIN
  -- Lock the property row
  PERFORM * FROM properties WHERE id = p_property_id FOR UPDATE;
  
  -- Check for conflicts
  SELECT COUNT(*) INTO v_conflict_count
  FROM availability_blocks
  WHERE property_id = p_property_id
  AND block_type = 'booked'
  AND (
    (start_date >= p_check_in AND start_date < p_check_out)
    OR (end_date > p_check_in AND end_date <= p_check_out)
    OR (start_date <= p_check_in AND end_date >= p_check_out)
  );
  
  IF v_conflict_count > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Property is not available for selected dates'
    );
  END IF;
  
  -- Create reservation
  INSERT INTO reservations (
    property_id,
    guest_name,
    guest_email,
    guest_phone,
    check_in_date,
    check_out_date,
    guest_count,
    total_amount,
    payment_status,
    booking_status,
    source_platform,
    stripe_session_id
  ) VALUES (
    p_property_id,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_check_in,
    p_check_out,
    p_guest_count,
    p_total_amount,
    p_payment_status,
    'confirmed',
    'direct',
    p_stripe_session_id
  )
  RETURNING id INTO v_reservation_id;
  
  -- Create availability block
  INSERT INTO availability_blocks (
    property_id,
    start_date,
    end_date,
    block_type,
    source_platform,
    notes
  ) VALUES (
    p_property_id,
    p_check_in,
    p_check_out,
    'booked',
    'direct',
    'Direct Booking'
  );
  
  RETURN json_build_object(
    'success', true,
    'reservation_id', v_reservation_id
  );
END;
$$ LANGUAGE plpgsql;