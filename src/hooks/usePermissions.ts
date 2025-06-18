
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UserPermissions {
  [key: string]: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch user permissions through the new role system
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role:system_roles(
            role_permissions(
              permission:system_permissions(*)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user permissions:', error);
        return;
      }

      // Build permissions object
      const userPermissions: UserPermissions = {};
      
      data?.forEach((userRole) => {
        const rolePermissions = userRole.role?.role_permissions || [];
        rolePermissions.forEach((rp) => {
          if (rp.permission?.key) {
            userPermissions[rp.permission.key] = true;
          }
        });
      });

      setPermissions(userPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
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
