-- Add direct user assignment column to task templates
ALTER TABLE public.platform_task_templates 
ADD COLUMN IF NOT EXISTS assign_to_user_id UUID REFERENCES auth.users(id);

-- Update the create_tasks_from_templates function to actually assign tasks
CREATE OR REPLACE FUNCTION public.create_tasks_from_templates(
  p_trigger_event TEXT,
  p_variables JSONB DEFAULT '{}'::JSONB,
  p_related_user_id UUID DEFAULT NULL,
  p_related_org_id UUID DEFAULT NULL
)
RETURNS SETOF platform_tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
  v_title TEXT;
  v_description TEXT;
  v_due_date TIMESTAMPTZ;
  v_assigned_to UUID;
  v_new_task platform_tasks;
BEGIN
  FOR v_template IN 
    SELECT * FROM platform_task_templates 
    WHERE trigger_event = p_trigger_event AND is_active = true
  LOOP
    -- Replace variables in title
    v_title := v_template.title_template;
    v_title := REPLACE(v_title, '{{user_name}}', COALESCE(p_variables->>'user_name', 'Unknown'));
    v_title := REPLACE(v_title, '{{user_email}}', COALESCE(p_variables->>'user_email', ''));
    v_title := REPLACE(v_title, '{{org_name}}', COALESCE(p_variables->>'org_name', 'Unknown'));
    
    -- Replace variables in description
    v_description := v_template.description_template;
    v_description := REPLACE(v_description, '{{user_name}}', COALESCE(p_variables->>'user_name', 'Unknown'));
    v_description := REPLACE(v_description, '{{user_email}}', COALESCE(p_variables->>'user_email', ''));
    v_description := REPLACE(v_description, '{{org_name}}', COALESCE(p_variables->>'org_name', 'Unknown'));
    
    -- Calculate due date
    IF v_template.due_days IS NOT NULL THEN
      v_due_date := NOW() + (v_template.due_days || ' days')::INTERVAL;
    ELSE
      v_due_date := NULL;
    END IF;
    
    -- Determine assignment
    -- Priority: 1) Specific user, 2) Role-based (random admin with that role), 3) Unassigned
    IF v_template.assign_to_user_id IS NOT NULL THEN
      -- Check if the assigned user is still an active platform admin
      SELECT user_id INTO v_assigned_to
      FROM platform_admins
      WHERE user_id = v_template.assign_to_user_id AND is_active = true;
    ELSIF v_template.assign_to_role IS NOT NULL THEN
      -- Get a random active platform admin with the specified role
      SELECT user_id INTO v_assigned_to
      FROM platform_admins
      WHERE role = v_template.assign_to_role AND is_active = true
      ORDER BY RANDOM()
      LIMIT 1;
    ELSE
      v_assigned_to := NULL;
    END IF;
    
    -- Insert the task
    INSERT INTO platform_tasks (
      title,
      description,
      priority,
      status,
      due_date,
      template_id,
      related_user_id,
      related_org_id,
      assigned_to,
      metadata
    ) VALUES (
      v_title,
      v_description,
      v_template.priority,
      'todo',
      v_due_date,
      v_template.id,
      p_related_user_id,
      p_related_org_id,
      v_assigned_to,
      jsonb_build_object(
        'trigger_event', p_trigger_event,
        'template_name', v_template.name,
        'variables', p_variables
      )
    )
    RETURNING * INTO v_new_task;
    
    RETURN NEXT v_new_task;
  END LOOP;
  
  RETURN;
END;
$$;