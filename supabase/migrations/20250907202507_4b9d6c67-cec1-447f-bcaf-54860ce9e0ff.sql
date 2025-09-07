-- Create property reservations table for tracking guest bookings
CREATE TABLE public.property_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  booking_status TEXT NOT NULL DEFAULT 'confirmed',
  source_platform TEXT DEFAULT 'direct',
  special_requests TEXT,
  cleaning_status TEXT DEFAULT 'pending',
  cleaning_work_order_id UUID,
  check_in_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create guest communication table
CREATE TABLE public.guest_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES property_reservations(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL, -- 'welcome', 'check_in', 'check_out', 'follow_up', 'custom'
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  delivery_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property analytics table
CREATE TABLE public.property_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  date DATE NOT NULL,
  occupancy_rate DECIMAL(5,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  average_daily_rate DECIMAL(10,2) DEFAULT 0,
  guest_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  cleaning_costs DECIMAL(10,2) DEFAULT 0,
  maintenance_costs DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.property_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for property reservations
CREATE POLICY "Admins can manage all reservations" 
ON public.property_reservations 
FOR ALL 
USING (is_admin());

CREATE POLICY "Public can create reservations" 
ON public.property_reservations 
FOR INSERT 
WITH CHECK (true);

-- Create policies for guest communications
CREATE POLICY "Admins can manage guest communications" 
ON public.guest_communications 
FOR ALL 
USING (is_admin());

-- Create policies for property analytics
CREATE POLICY "Admins can manage property analytics" 
ON public.property_analytics 
FOR ALL 
USING (is_admin());

-- Create trigger to update updated_at
CREATE TRIGGER update_property_reservations_updated_at
BEFORE UPDATE ON public.property_reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create cleaning work orders
CREATE OR REPLACE FUNCTION public.create_cleaning_work_order()
RETURNS TRIGGER AS $$
DECLARE
  cleaning_contractor_id UUID;
  new_work_order_id UUID;
BEGIN
  -- Only create work order for confirmed bookings
  IF NEW.booking_status = 'confirmed' AND OLD.booking_status != 'confirmed' THEN
    
    -- Find a cleaning contractor (you can modify this logic)
    SELECT id INTO cleaning_contractor_id 
    FROM contractors 
    WHERE 'cleaning' = ANY(specialties) 
    AND is_active = true 
    LIMIT 1;

    -- Create work order for cleaning
    INSERT INTO work_orders (
      property_id,
      title,
      description,
      priority,
      category,
      contractor_id,
      scheduled_date,
      created_by,
      status
    ) VALUES (
      NEW.property_id,
      'Turnover Cleaning - ' || NEW.guest_name,
      'Clean property between guests. Check-out: ' || NEW.check_out_date || ', Check-in: ' || NEW.check_in_date,
      'high',
      'cleaning',
      cleaning_contractor_id,
      NEW.check_out_date,
      auth.uid(),
      'pending'
    ) RETURNING id INTO new_work_order_id;

    -- Update reservation with work order ID
    NEW.cleaning_work_order_id = new_work_order_id;
    NEW.cleaning_status = 'scheduled';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;