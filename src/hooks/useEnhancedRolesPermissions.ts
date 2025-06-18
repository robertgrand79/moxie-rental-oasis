
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SystemRole, SystemPermission, CreateRoleData, UpdateRoleData, UserRole } from '@/types/roles';

export const useEnhancedRolesPermissions = () => {
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const fetchRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_roles')
        .select(`
          *,
          role_permissions(
            permission:system_permissions(*)
          ),
          user_roles(count)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      const rolesWithPermissions = data?.map(role => ({
        ...role,
        permissions: role.role_permissions?.map(rp => rp.permission).filter(Boolean) || [],
        user_count: role.user_roles?.[0]?.count || 0
      })) || [];

      setRoles(rolesWithPermissions);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch roles',
        variant: 'destructive',
      });
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_permissions')
        .select('*')
        .eq('is_active', true)
        .order('category, name');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch permissions',
        variant: 'destructive',
      });
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchRoles(), fetchPermissions()]);
    } finally {
      setLoading(false);
    }
  }, [fetchRoles, fetchPermissions]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const createRole = async (roleData: CreateRoleData): Promise<boolean> => {
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

      // Log the action
      await supabase
        .from('permission_audit_logs')
        .insert({
          action: 'role_created',
          target_type: 'role',
          target_id: newRole.id,
          target_name: roleData.name,
          performed_by: user?.id,
          details: { permissions: roleData.permissions }
        });

      toast({
        title: 'Success',
        description: `Role "${roleData.name}" created successfully.`,
      });

      await fetchRoles();
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

  const updateRole = async (roleId: string, updates: UpdateRoleData): Promise<boolean> => {
    setUpdating(true);
    try {
      // Update role basic info
      if (updates.name || updates.description !== undefined || updates.is_active !== undefined) {
        const { error: updateError } = await supabase
          .from('system_roles')
          .update({
            ...(updates.name && { name: updates.name }),
            ...(updates.description !== undefined && { description: updates.description }),
            ...(updates.is_active !== undefined && { is_active: updates.is_active })
          })
          .eq('id', roleId);

        if (updateError) throw updateError;
      }

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

      // Log the action
      await supabase
        .from('permission_audit_logs')
        .insert({
          action: 'role_updated',
          target_type: 'role',
          target_id: roleId,
          target_name: updates.name,
          performed_by: user?.id,
          details: updates
        });

      toast({
        title: 'Success',
        description: 'Role updated successfully.',
      });

      await fetchRoles();
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
      const role = roles.find(r => r.id === roleId);
      
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('system_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('permission_audit_logs')
        .insert({
          action: 'role_deleted',
          target_type: 'role',
          target_id: roleId,
          target_name: role?.name,
          performed_by: user?.id
        });

      toast({
        title: 'Success',
        description: 'Role deleted successfully.',
      });

      await fetchRoles();
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

  const assignRoleToUser = async (userId: string, roleId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: user?.id
        });

      if (error) throw error;

      const role = roles.find(r => r.id === roleId);
      
      // Log the action
      await supabase
        .from('permission_audit_logs')
        .insert({
          action: 'role_assigned',
          target_type: 'user',
          target_id: userId,
          performed_by: user?.id,
          details: { role_id: roleId, role_name: role?.name }
        });

      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  };

  const removeRoleFromUser = async (userId: string, roleId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;

      const role = roles.find(r => r.id === roleId);
      
      // Log the action
      await supabase
        .from('permission_audit_logs')
        .insert({
          action: 'role_removed',
          target_type: 'user',
          target_id: userId,
          performed_by: user?.id,
          details: { role_id: roleId, role_name: role?.name }
        });

      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  };

  const getUserRoles = async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:system_roles(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
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
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    refetch: fetchData
  };
};
