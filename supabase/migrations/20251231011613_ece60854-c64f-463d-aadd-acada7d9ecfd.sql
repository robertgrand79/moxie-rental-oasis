-- Create TV device pairings table
CREATE TABLE public.tv_device_pairings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT DEFAULT 'Living Room TV',
  pairing_code TEXT,
  pairing_code_expires_at TIMESTAMP WITH TIME ZONE,
  current_reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  guest_email TEXT,
  is_paired BOOLEAN NOT NULL DEFAULT false,
  paired_at TIMESTAMP WITH TIME ZONE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  display_mode TEXT NOT NULL DEFAULT 'welcome' CHECK (display_mode IN ('welcome', 'guest_portal', 'signage')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_id, property_id)
);

-- Create index for faster lookups
CREATE INDEX idx_tv_device_pairings_property ON public.tv_device_pairings(property_id);
CREATE INDEX idx_tv_device_pairings_organization ON public.tv_device_pairings(organization_id);
CREATE INDEX idx_tv_device_pairings_device_id ON public.tv_device_pairings(device_id);
CREATE INDEX idx_tv_device_pairings_pairing_code ON public.tv_device_pairings(pairing_code) WHERE pairing_code IS NOT NULL;

-- Enable RLS
ALTER TABLE public.tv_device_pairings ENABLE ROW LEVEL SECURITY;

-- Organization members can view TV devices in their org
CREATE POLICY "Organization members can view TV devices"
  ON public.tv_device_pairings
  FOR SELECT
  USING (user_belongs_to_organization(auth.uid(), organization_id));

-- Organization admins can manage TV devices
CREATE POLICY "Organization admins can manage TV devices"
  ON public.tv_device_pairings
  FOR ALL
  USING (user_is_org_admin(auth.uid(), organization_id));

-- Allow public read of unpaired device info for pairing flow
CREATE POLICY "Public can view unpaired device pairing codes"
  ON public.tv_device_pairings
  FOR SELECT
  USING (is_paired = false AND pairing_code IS NOT NULL AND pairing_code_expires_at > now());

-- Allow system/edge functions to update devices
CREATE POLICY "Service role can manage all TV devices"
  ON public.tv_device_pairings
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_tv_device_pairings_updated_at
  BEFORE UPDATE ON public.tv_device_pairings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create pairing audit log table
CREATE TABLE public.tv_pairing_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_pairing_id UUID REFERENCES public.tv_device_pairings(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.tv_pairing_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only org admins can view audit logs
CREATE POLICY "Organization admins can view TV pairing audit logs"
  ON public.tv_pairing_audit_logs
  FOR SELECT
  USING (user_is_org_admin(auth.uid(), organization_id));

-- System can insert audit logs
CREATE POLICY "System can insert TV pairing audit logs"
  ON public.tv_pairing_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Add TV display settings to assistant_settings table
ALTER TABLE public.assistant_settings
  ADD COLUMN IF NOT EXISTS tv_welcome_message TEXT,
  ADD COLUMN IF NOT EXISTS tv_show_avatar BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS tv_chat_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS tv_signage_rotation_seconds INTEGER DEFAULT 30;