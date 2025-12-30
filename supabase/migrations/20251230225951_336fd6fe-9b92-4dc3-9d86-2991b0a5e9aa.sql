-- Add assigned_user_id column to work_orders table for internal team assignments
ALTER TABLE public.work_orders 
ADD COLUMN assigned_user_id uuid REFERENCES public.profiles(id);

-- Add index for performance
CREATE INDEX idx_work_orders_assigned_user_id ON public.work_orders(assigned_user_id);

-- Add comment for documentation
COMMENT ON COLUMN public.work_orders.assigned_user_id IS 'Internal team member assigned to this work order (alternative to contractor assignment)';