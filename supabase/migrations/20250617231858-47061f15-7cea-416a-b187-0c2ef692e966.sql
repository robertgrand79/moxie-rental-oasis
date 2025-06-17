
-- Create custom task types table
CREATE TABLE public.custom_task_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'clipboard',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- Create task assignments junction table for multi-user assignments
CREATE TABLE public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.property_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID NOT NULL,
  UNIQUE(task_id, user_id)
);

-- Enhance property_tasks table with new recurring fields
ALTER TABLE public.property_tasks 
ADD COLUMN recurrence_frequency TEXT CHECK (recurrence_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN recurrence_interval INTEGER DEFAULT 1,
ADD COLUMN recurrence_end_date DATE,
ADD COLUMN task_type_id UUID REFERENCES public.custom_task_types(id);

-- Make project_id completely optional (it already is, but let's ensure it)
ALTER TABLE public.property_tasks 
ALTER COLUMN project_id DROP NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON public.task_assignments(user_id);
CREATE INDEX idx_property_tasks_task_type_id ON public.property_tasks(task_type_id);
CREATE INDEX idx_property_tasks_recurrence ON public.property_tasks(recurrence_frequency) WHERE recurrence_frequency IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.custom_task_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom_task_types
CREATE POLICY "Users can view active task types" 
  ON public.custom_task_types 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage task types" 
  ON public.custom_task_types 
  FOR ALL 
  USING (public.is_admin());

-- Create RLS policies for task_assignments
CREATE POLICY "Users can view task assignments" 
  ON public.task_assignments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage task assignments" 
  ON public.task_assignments 
  FOR ALL 
  USING (public.is_admin() OR user_id = auth.uid() OR assigned_by = auth.uid());

-- Insert default system task types
INSERT INTO public.custom_task_types (name, description, color, icon, is_system, created_by) VALUES
('Cleaning', 'General cleaning and housekeeping tasks', '#10B981', 'spray-can', true, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Maintenance', 'Property maintenance and repairs', '#F59E0B', 'wrench', true, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Inspection', 'Property inspections and assessments', '#6366F1', 'search', true, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Repair', 'Repair work and fixes', '#EF4444', 'hammer', true, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Supply Order', 'Ordering supplies and materials', '#8B5CF6', 'package', true, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Guest Service', 'Guest-related services and support', '#06B6D4', 'user-check', true, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
('Admin', 'Administrative tasks', '#6B7280', 'clipboard-list', true, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1));

-- Create trigger to update updated_at on custom_task_types
CREATE OR REPLACE FUNCTION update_custom_task_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_task_types_updated_at
  BEFORE UPDATE ON public.custom_task_types
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_task_types_updated_at();
