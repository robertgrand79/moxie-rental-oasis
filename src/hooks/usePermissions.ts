
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  UserPermissionsMap, 
  UserRoleJoin, 
  RolePermissionJoin,
  ADMIN_PERMISSIONS,
  DEFAULT_USER_PERMISSIONS 
} from '@/types/permissions';
import { 
  ADMIN_PERMISSIONS as adminPerms, 
  DEFAULT_USER_PERMISSIONS as defaultPerms 
} from '@/types/permissions';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissionsMap>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // First check if user is admin using legacy system
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // If user is admin, give them all permissions
      if (profile?.role === 'admin') {
        setPermissions(adminPerms);
        return;
      }

      // Try to fetch permissions through the new role system with explicit column hints
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            role:system_roles!user_roles_role_id_fkey(
              role_permissions(
                permission:system_permissions(*)
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (!error && data?.length > 0) {
          // Build permissions object from new system
          const userPermissions: UserPermissionsMap = {};
          
          data.forEach((userRole) => {
            // Type the role properly from the join result - use unknown first for Supabase complex joins
            const role = userRole.role as unknown as UserRoleJoin['role'];
            const rolePermissions = role?.role_permissions || [];
            rolePermissions.forEach((rp) => {
              const permission = (rp as RolePermissionJoin).permission;
              if (permission?.key) {
                userPermissions[permission.key] = true;
              }
            });
          });

          setPermissions(userPermissions);
          return;
        }
      } catch (newSystemError) {
        console.warn('New permission system not available:', newSystemError);
      }

      // Fallback: basic permissions for regular users
      setPermissions(defaultPerms);

    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions[permission] === true;
  }, [permissions]);

  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchUserPermissions
  };
};
