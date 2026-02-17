-- Drop the ambiguous 2-arg overload so signup trigger can resolve the function call
DROP FUNCTION IF EXISTS public.create_tasks_from_templates(text, jsonb);