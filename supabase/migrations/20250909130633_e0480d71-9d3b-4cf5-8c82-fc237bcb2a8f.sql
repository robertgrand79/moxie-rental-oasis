-- Create Seam.co Smart Home Integration Tables

-- Extend device_configurations for Seam compatibility
ALTER TABLE public.device_configurations 
ADD COLUMN IF NOT EXISTS seam_device_id text,
ADD COLUMN IF NOT EXISTS seam_workspace_id text,
ADD COLUMN IF NOT EXISTS device_brand text,
ADD COLUMN IF NOT EXISTS device_model text,
ADD COLUMN IF NOT EXISTS battery_level integer,
ADD COLUMN IF NOT EXISTS connectivity_status text DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS last_seam_sync timestamp with time zone;

-- Create seam_workspaces table to store workspace configurations per property
CREATE TABLE IF NOT EXISTS public.seam_workspaces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  workspace_id text NOT NULL UNIQUE,
  workspace_name text NOT NULL,
  api_key_configured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_sync_at timestamp with time zone,
  sync_status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create seam_devices table for comprehensive device tracking
CREATE TABLE IF NOT EXISTS public.seam_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seam_device_id text NOT NULL UNIQUE,
  workspace_id text REFERENCES public.seam_workspaces(workspace_id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  device_type text NOT NULL, -- 'smart_lock', 'thermostat'
  device_brand text NOT NULL, -- 'august', 'honeywell'
  device_model text,
  device_name text NOT NULL,
  location text, -- 'front_door', 'back_door', 'living_room'
  is_online boolean DEFAULT false,
  battery_level integer,
  battery_status text, -- 'full', 'good', 'low', 'critical'
  firmware_version text,
  last_seen_at timestamp with time zone,
  device_properties jsonb DEFAULT '{}',
  capabilities jsonb DEFAULT '{}', -- what the device can do
  current_state jsonb DEFAULT '{}', -- current lock status, temperature, etc.
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create seam_access_codes table for guest access management
CREATE TABLE IF NOT EXISTS public.seam_access_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seam_access_code_id text NOT NULL UNIQUE,
  device_id uuid REFERENCES public.seam_devices(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES public.property_reservations(id) ON DELETE CASCADE,
  code_value text,
  code_name text NOT NULL,
  access_type text DEFAULT 'time_bound', -- 'time_bound', 'ongoing'
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  max_usage_count integer,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create device_events table for comprehensive logging
CREATE TABLE IF NOT EXISTS public.device_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id uuid REFERENCES public.seam_devices(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'lock.locked', 'lock.unlocked', 'thermostat.temperature_changed'
  event_source text DEFAULT 'seam_webhook', -- 'seam_webhook', 'manual', 'automation'
  event_data jsonb DEFAULT '{}',
  access_code_id uuid REFERENCES public.seam_access_codes(id),
  triggered_by uuid REFERENCES public.profiles(id),
  occurred_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create device_automations table for automation rules
CREATE TABLE IF NOT EXISTS public.device_automations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  automation_name text NOT NULL,
  automation_type text NOT NULL, -- 'checkin', 'checkout', 'schedule'
  trigger_conditions jsonb DEFAULT '{}',
  target_devices uuid[] DEFAULT '{}', -- array of device IDs
  actions jsonb DEFAULT '{}', -- what to do when triggered
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create device_maintenance_alerts table
CREATE TABLE IF NOT EXISTS public.device_maintenance_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id uuid REFERENCES public.seam_devices(id) ON DELETE CASCADE,
  alert_type text NOT NULL, -- 'low_battery', 'offline', 'maintenance_due'
  severity text DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES public.profiles(id),
  work_order_id uuid REFERENCES public.work_orders(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seam_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seam_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seam_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_maintenance_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for admins to manage all Seam data
CREATE POLICY "Admins can manage seam workspaces" ON public.seam_workspaces FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage seam devices" ON public.seam_devices FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage seam access codes" ON public.seam_access_codes FOR ALL USING (is_admin());
CREATE POLICY "Admins can view device events" ON public.device_events FOR SELECT USING (is_admin());
CREATE POLICY "System can insert device events" ON public.device_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage device automations" ON public.device_automations FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage maintenance alerts" ON public.device_maintenance_alerts FOR ALL USING (is_admin());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seam_devices_workspace ON public.seam_devices(workspace_id);
CREATE INDEX IF NOT EXISTS idx_seam_devices_property ON public.seam_devices(property_id);
CREATE INDEX IF NOT EXISTS idx_seam_devices_type ON public.seam_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_seam_access_codes_device ON public.seam_access_codes(device_id);
CREATE INDEX IF NOT EXISTS idx_seam_access_codes_reservation ON public.seam_access_codes(reservation_id);
CREATE INDEX IF NOT EXISTS idx_device_events_device ON public.device_events(device_id);
CREATE INDEX IF NOT EXISTS idx_device_events_type ON public.device_events(event_type);
CREATE INDEX IF NOT EXISTS idx_device_events_occurred ON public.device_events(occurred_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_seam_workspaces_updated_at
  BEFORE UPDATE ON public.seam_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seam_devices_updated_at
  BEFORE UPDATE ON public.seam_devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seam_access_codes_updated_at
  BEFORE UPDATE ON public.seam_access_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_automations_updated_at
  BEFORE UPDATE ON public.device_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();