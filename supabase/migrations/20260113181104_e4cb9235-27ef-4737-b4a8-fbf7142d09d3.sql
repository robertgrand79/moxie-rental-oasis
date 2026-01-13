-- Drop and recreate platform_tasks policies with proper with_check clauses
DROP POLICY IF EXISTS "Platform admins can manage tasks" ON platform_tasks;
DROP POLICY IF EXISTS "Platform admins can view all tasks" ON platform_tasks;

-- Recreate with explicit policies for each operation
CREATE POLICY "Platform admins can view tasks"
ON platform_tasks FOR SELECT
USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can insert tasks"
ON platform_tasks FOR INSERT
WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update tasks"
ON platform_tasks FOR UPDATE
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete tasks"
ON platform_tasks FOR DELETE
USING (is_platform_admin(auth.uid()));