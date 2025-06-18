
export interface SystemRole {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  permissions?: SystemPermission[];
  user_count?: number;
}

export interface SystemPermission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_by: string | null;
  granted_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: string;
  expires_at: string | null;
  is_active: boolean;
  role?: SystemRole;
}

export interface PermissionAuditLog {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  target_name: string | null;
  performed_by: string;
  details: Record<string, any> | null;
  created_at: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
}
