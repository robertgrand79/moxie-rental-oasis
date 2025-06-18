
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export const useRolesPermissions = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch roles with their permissions and user counts
      const { data: rolesData, error: rolesError } = await supabase
        .from('system_roles')
        .select(`
          *,
          role_permissions(
            permission:system_permissions(key)
          )
        `)
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      // Fetch user counts for each role
      const rolesWithCounts = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { count } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', role.id)
            .eq('is_active', true);

          return {
            id: role.id,
            name: role.name,
            description: role.description || '',
            userCount: count || 0,
            permissions: role.role_permissions?.map(rp => rp.permission?.key).filter(Boolean) || []
          };
        })
      );

      setRoles(rolesWithCounts);

      // Fetch permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('system_permissions')
        .select('*')
        .eq('is_active', true)
        .order('category, name');

      if (permissionsError) throw permissionsError;

      const formattedPermissions = (permissionsData || []).map(permission => ({
        id: permission.key,
        name: permission.name,
        description: permission.description || '',
        enabled: permission.is_active
      }));

      setPermissions(formattedPermissions);
      
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load roles and permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: { name: string; description: string; permissions: string[] }): Promise<boolean> => {
    setUpdating(true);
    try {
      // Create the role
      const { data: newRole, error: roleError } = await supabase
        .from('system_roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          created_by: user?.id
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Assign permissions to the role
      if (roleData.permissions.length > 0) {
        const { data: permissionIds, error: permissionError } = await supabase
          .from('system_permissions')
          .select('id')
          .in('key', roleData.permissions);

        if (permissionError) throw permissionError;

        const rolePermissions = permissionIds.map(p => ({
          role_id: newRole.id,
          permission_id: p.id,
          granted_by: user?.id
        }));

        const { error: assignError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (assignError) throw assignError;
      }

      toast({
        title: 'Success',
        description: `Role "${roleData.name}" created successfully.`,
      });
      
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateRole = async (roleId: string, updates: Partial<Role>): Promise<boolean> => {
    setUpdating(true);
    try {
      // Update role basic info
      const { error: updateError } = await supabase
        .from('system_roles')
        .update({
          name: updates.name,
          description: updates.description
        })
        .eq('id', roleId);

      if (updateError) throw updateError;

      // Update permissions if provided
      if (updates.permissions) {
        // Remove existing permissions
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId);

        // Add new permissions
        if (updates.permissions.length > 0) {
          const { data: permissionIds, error: permissionError } = await supabase
            .from('system_permissions')
            .select('id')
            .in('key', updates.permissions);

          if (permissionError) throw permissionError;

          const rolePermissions = permissionIds.map(p => ({
            role_id: roleId,
            permission_id: p.id,
            granted_by: user?.id
          }));

          const { error: assignError } = await supabase
            .from('role_permissions')
            .insert(rolePermissions);

          if (assignError) throw assignError;
        }
      }

      toast({
        title: 'Success',
        description: 'Role updated successfully.',
      });
      
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteRole = async (roleId: string): Promise<boolean> => {
    setUpdating(true);
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('system_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role deleted successfully.',
      });
      
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const togglePermission = async (permissionId: string): Promise<boolean> => {
    setUpdating(true);
    try {
      const permission = permissions.find(p => p.id === permissionId);
      if (!permission) return false;

      const { error } = await supabase
        .from('system_permissions')
        .update({ is_active: !permission.enabled })
        .eq('key', permissionId);

      if (error) throw error;

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permission. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    roles,
    permissions,
    loading,
    updating,
    createRole,
    updateRole,
    deleteRole,
    togglePermission,
  };
};
