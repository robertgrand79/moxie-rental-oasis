
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

  // Initialize with static data for now - in a real implementation, this would come from the database
  useEffect(() => {
    if (user) {
      setRoles([
        {
          id: '1',
          name: 'Admin',
          description: 'Full system access',
          userCount: 1,
          permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings']
        },
        {
          id: '2',
          name: 'Editor',
          description: 'Can edit content',
          userCount: 2,
          permissions: ['read', 'write']
        },
        {
          id: '3',
          name: 'User',
          description: 'Basic user access',
          userCount: 5,
          permissions: ['read']
        }
      ]);

      setPermissions([
        { id: 'read', name: 'Read', description: 'View content and data', enabled: true },
        { id: 'write', name: 'Write', description: 'Create and edit content', enabled: true },
        { id: 'delete', name: 'Delete', description: 'Remove content and data', enabled: true },
        { id: 'manage_users', name: 'Manage Users', description: 'Add, edit, and remove users', enabled: true },
        { id: 'manage_settings', name: 'Manage Settings', description: 'Configure system settings', enabled: true }
      ]);

      setLoading(false);
    }
  }, [user]);

  const createRole = async (roleData: { name: string; description: string; permissions: string[] }): Promise<boolean> => {
    setUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRole: Role = {
        id: (roles.length + 1).toString(),
        name: roleData.name,
        description: roleData.description,
        userCount: 0,
        permissions: roleData.permissions
      };

      setRoles(prev => [...prev, newRole]);
      
      toast({
        title: 'Success',
        description: `Role "${roleData.name}" created successfully.`,
      });
      
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRoles(prev => prev.map(role => 
        role.id === roleId ? { ...role, ...updates } : role
      ));
      
      toast({
        title: 'Success',
        description: 'Role updated successfully.',
      });
      
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRoles(prev => prev.filter(role => role.id !== roleId));
      
      toast({
        title: 'Success',
        description: 'Role deleted successfully.',
      });
      
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPermissions(prev => prev.map(permission => 
        permission.id === permissionId 
          ? { ...permission, enabled: !permission.enabled }
          : permission
      ));
      
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
