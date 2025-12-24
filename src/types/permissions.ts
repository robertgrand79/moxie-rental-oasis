/**
 * Permission and Role System Types
 * Used by usePermissions.ts and useRoleSystem.ts
 */

/**
 * Permission key-value map for quick lookup
 */
export interface UserPermissionsMap {
  [key: string]: boolean;
}

/**
 * Individual permission definition
 */
export interface Permission {
  key: string;
  name: string;
  description: string | null;
  category: string;
}

/**
 * Role permission join result from Supabase
 */
export interface RolePermissionJoin {
  permission: Permission | null;
}

/**
 * System role definition
 */
export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  role_permissions?: RolePermissionJoin[];
}

/**
 * User role join result from Supabase
 */
export interface UserRoleJoin {
  role: Role | null;
}

/**
 * Role system state
 */
export interface RoleSystemState {
  userRole: Role | null;
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

/**
 * Default permissions for admin users
 */
export const ADMIN_PERMISSIONS: UserPermissionsMap = {
  'users.create': true,
  'users.read': true,
  'users.update': true,
  'users.delete': true,
  'users.manage_roles': true,
  'admin.access_panel': true,
  'admin.manage_settings': true,
  'admin.view_logs': true,
  'admin.manage_roles': true,
  'admin.manage_permissions': true,
  'content.create': true,
  'content.read': true,
  'content.update': true,
  'content.delete': true,
  'content.publish': true,
  'properties.create': true,
  'properties.read': true,
  'properties.update': true,
  'properties.delete': true,
  'properties.manage_bookings': true,
  'reports.view': true,
  'reports.export': true,
  'analytics.view': true,
};

/**
 * Default permissions for regular users
 */
export const DEFAULT_USER_PERMISSIONS: UserPermissionsMap = {
  'content.read': true,
  'properties.read': true,
};

/**
 * Default admin permission objects
 */
export const ADMIN_PERMISSION_OBJECTS: Permission[] = [
  { key: 'admin.access_panel', name: 'Access Admin Panel', description: 'Access admin interface', category: 'Administration' },
  { key: 'users.manage_roles', name: 'Manage Users', description: 'Manage user accounts', category: 'User Management' },
  { key: 'admin.manage_roles', name: 'Manage Roles', description: 'Manage system roles', category: 'Administration' },
  { key: 'content.create', name: 'Create Content', description: 'Create content', category: 'Content Management' },
  { key: 'properties.create', name: 'Create Properties', description: 'Create properties', category: 'Property Management' },
];

/**
 * Default user permission objects
 */
export const DEFAULT_USER_PERMISSION_OBJECTS: Permission[] = [
  { key: 'content.read', name: 'View Content', description: 'View content', category: 'Content' },
  { key: 'properties.read', name: 'View Properties', description: 'View properties', category: 'Properties' },
];

/**
 * Default admin role
 */
export const DEFAULT_ADMIN_ROLE: Role = {
  id: 'admin',
  name: 'Admin',
  description: 'Full administrative access',
  is_system_role: true,
};

/**
 * Default user role
 */
export const DEFAULT_USER_ROLE: Role = {
  id: 'user',
  name: 'User',
  description: 'Basic user access',
  is_system_role: true,
};
