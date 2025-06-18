
-- Add foreign key constraint to link task_assignments.user_id to profiles.id
ALTER TABLE task_assignments 
ADD CONSTRAINT fk_task_assignments_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint to link task_assignments.assigned_by to profiles.id  
ALTER TABLE task_assignments 
ADD CONSTRAINT fk_task_assignments_assigned_by 
FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL;
