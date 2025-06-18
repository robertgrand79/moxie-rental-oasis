
-- Phase 1: Database Setup & Migration

-- First, ensure we have proper foreign key relationships
ALTER TABLE public.role_permissions 
DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey,
DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;

ALTER TABLE public.role_permissions 
ADD CONSTRAINT role_permissions_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES public.system_roles(id) ON DELETE CASCADE,
ADD CONSTRAINT role_permissions_permission_id_fkey 
FOREIGN KEY (permission_id) REFERENCES public.system_permissions(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey,
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
DROP CONSTRAINT IF EXISTS user_roles_assigned_by_fkey;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES public.system_roles(id) ON DELETE CASCADE,
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
ADD CONSTRAINT user_roles_assigned_by_fkey 
FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Clear existing data to avoid conflicts
DELETE FROM public.role_permissions;
DELETE FROM public.user_roles;
DELETE FROM public.system_roles;
DELETE FROM public.system_permissions;

-- Insert default system permissions
INSERT INTO public.system_permissions (key, name, description, category) VALUES
-- User Management
('users.create', 'Create Users', 'Ability to invite and create new users', 'User Management'),
('users.read', 'View Users', 'Ability to view user information', 'User Management'),
('users.update', 'Edit Users', 'Ability to edit user profiles and information', 'User Management'),
('users.delete', 'Delete Users', 'Ability to delete user accounts', 'User Management'),
('users.manage_roles', 'Manage User Roles', 'Ability to assign and modify user roles', 'User Management'),

-- Content Management
('content.create', 'Create Content', 'Ability to create new content (blog posts, pages)', 'Content Management'),
('content.read', 'View Content', 'Ability to view content', 'Content Management'),
('content.update', 'Edit Content', 'Ability to edit existing content', 'Content Management'),
('content.delete', 'Delete Content', 'Ability to delete content', 'Content Management'),
('content.publish', 'Publish Content', 'Ability to publish and unpublish content', 'Content Management'),

-- Property Management
('properties.create', 'Create Properties', 'Ability to add new properties', 'Property Management'),
('properties.read', 'View Properties', 'Ability to view property information', 'Property Management'),
('properties.update', 'Edit Properties', 'Ability to edit property details', 'Property Management'),
('properties.delete', 'Delete Properties', 'Ability to remove properties', 'Property Management'),

-- System Administration
('admin.access_panel', 'Access Admin Panel', 'Ability to access the administration interface', 'System Administration'),
('admin.manage_settings', 'Manage Settings', 'Ability to configure system settings', 'System Administration'),
('admin.view_logs', 'View System Logs', 'Ability to view system and audit logs', 'System Administration'),
('admin.manage_roles', 'Manage Roles', 'Ability to create and manage system roles', 'System Administration');

-- Insert default system roles
INSERT INTO public.system_roles (name, description, is_system_role) VALUES
('Admin', 'Full administrative access to all features', true),
('User', 'Basic user access with limited permissions', true);

-- Assign permissions to roles
WITH admin_role AS (SELECT id FROM public.system_roles WHERE name = 'Admin'),
     user_role AS (SELECT id FROM public.system_roles WHERE name = 'User'),
     all_permissions AS (SELECT id FROM public.system_permissions)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT admin_role.id, all_permissions.id
FROM admin_role, all_permissions;

-- Give users basic read permissions
WITH user_role AS (SELECT id FROM public.system_roles WHERE name = 'User'),
     basic_permissions AS (
       SELECT id FROM public.system_permissions 
       WHERE key IN ('content.read', 'properties.read')
     )
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT user_role.id, basic_permissions.id
FROM user_role, basic_permissions;

-- Migrate existing users from profiles.role to user_roles system
WITH admin_role AS (SELECT id FROM public.system_roles WHERE name = 'Admin'),
     user_role AS (SELECT id FROM public.system_roles WHERE name = 'User'),
     admin_users AS (SELECT id FROM public.profiles WHERE role = 'admin'),
     regular_users AS (SELECT id FROM public.profiles WHERE role = 'user' OR role IS NULL)
INSERT INTO public.user_roles (user_id, role_id, assigned_at)
SELECT admin_users.id, admin_role.id, now()
FROM admin_users, admin_role
UNION ALL
SELECT regular_users.id, user_role.id, now()
FROM regular_users, user_role;
