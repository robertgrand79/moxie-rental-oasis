-- Create dynamic pricing table for PriceLabs integration
CREATE TABLE public.dynamic_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  pricelabs_price DECIMAL(10,2),
  manual_override_price DECIMAL(10,2),
  final_price DECIMAL(10,2) NOT NULL,
  pricing_source TEXT NOT NULL DEFAULT 'base', -- 'base', 'pricelabs', 'manual'
  occupancy_rate DECIMAL(5,2),
  market_demand TEXT, -- 'low', 'medium', 'high'
  special_events TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, date)
);

-- Create external calendar integrations table
CREATE TABLE public.external_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'airbnb', 'vrbo', 'booking_com'
  external_property_id TEXT NOT NULL,
  calendar_url TEXT, -- iCal URL
  api_credentials JSONB, -- encrypted API keys/tokens
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'success', 'error'
  sync_errors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, platform)
);

-- Create availability blocks table for managing bookings across platforms
CREATE TABLE public.availability_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  block_type TEXT NOT NULL, -- 'reservation', 'maintenance', 'owner_use', 'external_booking'
  source_platform TEXT, -- 'internal', 'airbnb', 'vrbo', 'booking_com'
  external_booking_id TEXT,
  guest_count INTEGER DEFAULT 1,
  notes TEXT,
  sync_status TEXT DEFAULT 'synced', -- 'synced', 'pending_sync', 'sync_failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing rules table for automated pricing logic
CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'seasonal', 'length_of_stay', 'advance_booking', 'last_minute'
  conditions JSONB NOT NULL, -- rule conditions (dates, days_advance, etc.)
  adjustment_type TEXT NOT NULL, -- 'percentage', 'fixed_amount'
  adjustment_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 0, -- for rule ordering
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sync logs table for monitoring integration health
CREATE TABLE public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'pricing', 'availability', 'booking'
  status TEXT NOT NULL, -- 'success', 'error', 'warning'
  message TEXT,
  data_synced JSONB,
  error_details JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance reservations table with external platform integration
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS external_platform TEXT,
ADD COLUMN IF NOT EXISTS external_booking_id TEXT,
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS service_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS taxes DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Enable Row Level Security
ALTER TABLE public.dynamic_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage dynamic pricing" ON public.dynamic_pricing FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage external calendars" ON public.external_calendars FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage availability blocks" ON public.availability_blocks FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules FOR ALL USING (is_admin());
CREATE POLICY "Admins can view sync logs" ON public.sync_logs FOR SELECT USING (is_admin());
CREATE POLICY "System can insert sync logs" ON public.sync_logs FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_dynamic_pricing_property_date ON public.dynamic_pricing(property_id, date);
CREATE INDEX idx_availability_blocks_property_dates ON public.availability_blocks(property_id, start_date, end_date);
CREATE INDEX idx_external_calendars_property_platform ON public.external_calendars(property_id, platform);
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);
CREATE INDEX idx_reservations_external_booking ON public.reservations(external_platform, external_booking_id) WHERE external_platform IS NOT NULL;

-- Create updated_at triggers
CREATE TRIGGER update_dynamic_pricing_updated_at BEFORE UPDATE ON public.dynamic_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_calendars_updated_at BEFORE UPDATE ON public.external_calendars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_blocks_updated_at BEFORE UPDATE ON public.availability_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();