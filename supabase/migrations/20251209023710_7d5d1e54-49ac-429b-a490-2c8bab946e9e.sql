-- Create assistant_settings table for public AI chat widget configuration
CREATE TABLE public.assistant_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  display_name TEXT NOT NULL DEFAULT 'Stay Moxie Assistant',
  welcome_message TEXT NOT NULL DEFAULT 'Hi! I''m your AI assistant. How can I help you today?',
  bubble_color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.assistant_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings for enabled assistants
CREATE POLICY "Public can view enabled assistant settings"
ON public.assistant_settings
FOR SELECT
USING (is_enabled = true);

-- Organization admins can manage their settings
CREATE POLICY "Organization admins can manage assistant settings"
ON public.assistant_settings
FOR ALL
USING (public.user_belongs_to_organization(auth.uid(), organization_id));

-- Create trigger for updated_at
CREATE TRIGGER update_assistant_settings_updated_at
BEFORE UPDATE ON public.assistant_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();