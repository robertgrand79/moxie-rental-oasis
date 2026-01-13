-- Create task templates table for workflow automation
CREATE TABLE public.platform_task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL, -- 'user_registration', 'organization_created', 'support_ticket', 'manual'
  title_template TEXT NOT NULL, -- Supports variables like {{user_name}}, {{org_name}}
  description_template TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  due_days INTEGER, -- Days after trigger to set due date
  assign_to_role TEXT, -- 'platform_admin', 'support_staff', or null for unassigned
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_task_templates_trigger ON public.platform_task_templates(trigger_event) WHERE is_active = true;
CREATE INDEX idx_task_templates_active ON public.platform_task_templates(is_active, sort_order);

-- Enable RLS
ALTER TABLE public.platform_task_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies - only platform admins can manage templates
CREATE POLICY "Platform admins can view task templates"
  ON public.platform_task_templates
  FOR SELECT
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can create task templates"
  ON public.platform_task_templates
  FOR INSERT
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update task templates"
  ON public.platform_task_templates
  FOR UPDATE
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete task templates"
  ON public.platform_task_templates
  FOR DELETE
  USING (is_platform_admin(auth.uid()));

-- Add metadata column to platform_tasks for tracking source
ALTER TABLE public.platform_tasks 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.platform_task_templates(id),
ADD COLUMN IF NOT EXISTS related_user_id UUID,
ADD COLUMN IF NOT EXISTS related_org_id UUID;

-- Create function to generate tasks from templates
CREATE OR REPLACE FUNCTION public.create_tasks_from_templates(
  p_trigger_event TEXT,
  p_variables JSONB DEFAULT '{}'
) RETURNS INTEGER AS $$
DECLARE
  template RECORD;
  task_title TEXT;
  task_description TEXT;
  task_due_date DATE;
  tasks_created INTEGER := 0;
BEGIN
  FOR template IN 
    SELECT * FROM public.platform_task_templates 
    WHERE trigger_event = p_trigger_event 
    AND is_active = true
    ORDER BY sort_order
  LOOP
    -- Replace template variables
    task_title := template.title_template;
    task_description := template.description_template;
    
    -- Replace common variables
    task_title := REPLACE(task_title, '{{user_name}}', COALESCE(p_variables->>'user_name', 'Unknown'));
    task_title := REPLACE(task_title, '{{user_email}}', COALESCE(p_variables->>'user_email', ''));
    task_title := REPLACE(task_title, '{{org_name}}', COALESCE(p_variables->>'org_name', ''));
    task_title := REPLACE(task_title, '{{date}}', TO_CHAR(NOW(), 'Mon DD, YYYY'));
    
    IF task_description IS NOT NULL THEN
      task_description := REPLACE(task_description, '{{user_name}}', COALESCE(p_variables->>'user_name', 'Unknown'));
      task_description := REPLACE(task_description, '{{user_email}}', COALESCE(p_variables->>'user_email', ''));
      task_description := REPLACE(task_description, '{{org_name}}', COALESCE(p_variables->>'org_name', ''));
      task_description := REPLACE(task_description, '{{date}}', TO_CHAR(NOW(), 'Mon DD, YYYY'));
    END IF;
    
    -- Calculate due date
    IF template.due_days IS NOT NULL THEN
      task_due_date := CURRENT_DATE + template.due_days;
    ELSE
      task_due_date := NULL;
    END IF;
    
    -- Insert the task
    INSERT INTO public.platform_tasks (
      title,
      description,
      priority,
      due_date,
      template_id,
      related_user_id,
      related_org_id,
      metadata
    ) VALUES (
      task_title,
      task_description,
      template.priority,
      task_due_date,
      template.id,
      (p_variables->>'user_id')::UUID,
      (p_variables->>'org_id')::UUID,
      jsonb_build_object(
        'trigger_event', p_trigger_event,
        'triggered_at', NOW(),
        'template_name', template.name
      )
    );
    
    tasks_created := tasks_created + 1;
  END LOOP;
  
  RETURN tasks_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function for user registration
CREATE OR REPLACE FUNCTION public.on_user_created_tasks()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  variables JSONB;
BEGIN
  -- Get user name from raw_user_meta_data
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'first_name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  variables := jsonb_build_object(
    'user_id', NEW.id,
    'user_name', user_name,
    'user_email', NEW.email
  );
  
  PERFORM public.create_tasks_from_templates('user_registration', variables);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created_tasks
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_user_created_tasks();

-- Create trigger function for organization creation
CREATE OR REPLACE FUNCTION public.on_organization_created_tasks()
RETURNS TRIGGER AS $$
DECLARE
  variables JSONB;
BEGIN
  variables := jsonb_build_object(
    'org_id', NEW.id,
    'org_name', NEW.name
  );
  
  PERFORM public.create_tasks_from_templates('organization_created', variables);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on organizations
CREATE TRIGGER on_organization_created_tasks
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.on_organization_created_tasks();

-- Insert default task templates for user onboarding
INSERT INTO public.platform_task_templates (name, trigger_event, title_template, description_template, priority, due_days, sort_order)
VALUES 
  ('Welcome New User', 'user_registration', 'Welcome call with {{user_name}}', 'Schedule a welcome call to help {{user_name}} ({{user_email}}) get started with the platform.', 'high', 1, 1),
  ('Account Setup Check', 'user_registration', 'Verify account setup for {{user_name}}', 'Review that {{user_email}} has completed their profile and basic settings.', 'normal', 3, 2),
  ('Follow-up After Registration', 'user_registration', 'Follow-up with {{user_name}}', 'Check in with {{user_name}} to see if they need any assistance after one week.', 'normal', 7, 3);

-- Insert templates for organization creation
INSERT INTO public.platform_task_templates (name, trigger_event, title_template, description_template, priority, due_days, sort_order)
VALUES 
  ('New Organization Review', 'organization_created', 'Review new org: {{org_name}}', 'Review the new organization "{{org_name}}" setup and configuration.', 'high', 1, 1),
  ('Org Onboarding Checklist', 'organization_created', 'Complete onboarding for {{org_name}}', 'Ensure {{org_name}} has completed the onboarding checklist and added their first property.', 'normal', 5, 2);

-- Update timestamp trigger for templates
CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON public.platform_task_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();