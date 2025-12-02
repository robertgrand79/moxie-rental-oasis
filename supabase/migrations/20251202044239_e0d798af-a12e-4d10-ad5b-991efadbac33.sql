-- Create message_templates table
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messaging_rules table
CREATE TABLE public.messaging_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.message_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_offset_hours INTEGER NOT NULL DEFAULT 0,
  trigger_time TIME DEFAULT '09:00:00',
  delivery_channel TEXT NOT NULL DEFAULT 'email',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_messages table
CREATE TABLE public.scheduled_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES public.property_reservations(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.messaging_rules(id) ON DELETE SET NULL,
  template_id UUID NOT NULL REFERENCES public.message_templates(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_templates
CREATE POLICY "Admins can manage message templates"
  ON public.message_templates FOR ALL
  USING (is_admin());

CREATE POLICY "Public can view active templates"
  ON public.message_templates FOR SELECT
  USING (is_active = true);

-- RLS policies for messaging_rules
CREATE POLICY "Admins can manage messaging rules"
  ON public.messaging_rules FOR ALL
  USING (is_admin());

-- RLS policies for scheduled_messages
CREATE POLICY "Admins can manage scheduled messages"
  ON public.scheduled_messages FOR ALL
  USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_message_templates_property ON public.message_templates(property_id);
CREATE INDEX idx_message_templates_category ON public.message_templates(category);
CREATE INDEX idx_messaging_rules_property ON public.messaging_rules(property_id);
CREATE INDEX idx_messaging_rules_trigger ON public.messaging_rules(trigger_type);
CREATE INDEX idx_scheduled_messages_status ON public.scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_for ON public.scheduled_messages(scheduled_for);

-- Update timestamp triggers
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messaging_rules_updated_at
  BEFORE UPDATE ON public.messaging_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();