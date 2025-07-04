-- Fix the user_roles table foreign key constraint conflict
-- Drop the existing constraints to avoid duplication
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS fk_user_roles_role_id;

-- Recreate the foreign key constraint with proper naming
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES public.system_roles(id) ON DELETE CASCADE;