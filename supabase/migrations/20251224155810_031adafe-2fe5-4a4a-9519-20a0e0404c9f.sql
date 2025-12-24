-- Fix search path for function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add missing policies for system_status (already has select policy, add admin policies)
CREATE POLICY "Admins can manage system status" ON public.system_status
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('platform_admin', 'super_admin')
    )
  );

-- Add admin policies for system_incidents
CREATE POLICY "Admins can manage incidents" ON public.system_incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('platform_admin', 'super_admin')
    )
  );

-- Add admin policies for incident_updates
CREATE POLICY "Admins can manage incident updates" ON public.incident_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('platform_admin', 'super_admin')
    )
  );