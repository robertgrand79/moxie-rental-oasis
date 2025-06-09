
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserPermissions {
  // Content Management
  manage_blog: boolean;
  manage_pages: boolean;
  manage_properties: boolean;
  manage_testimonials: boolean;
  
  // Site Configuration
  manage_site_settings: boolean;
  manage_seo: boolean;
  manage_analytics: boolean;
  
  // User Management
  manage_users: boolean;
  manage_roles: boolean;
  
  // Content Operations
  manage_events: boolean;
  manage_lifestyle_gallery: boolean;
  manage_poi: boolean;
  
  // Advanced Features
  manage_ai_tools: boolean;
  manage_integrations: boolean;
  view_analytics: boolean;
  
  // System
  manage_work_orders: boolean;
  manage_tasks: boolean;
}

export const defaultPermissions: UserPermissions = {
  manage_blog: false,
  manage_pages: false,
  manage_properties: false,
  manage_testimonials: false,
  manage_site_settings: false,
  manage_seo: false,
  manage_analytics: false,
  manage_users: false,
  manage_roles: false,
  manage_events: false,
  manage_lifestyle_gallery: false,
  manage_poi: false,
  manage_ai_tools: false,
  manage_integrations: false,
  view_analytics: false,
  manage_work_orders: false,
  manage_tasks: false,
};

export const permissionCategories = {
  'Content Management': ['manage_blog', 'manage_pages', 'manage_properties', 'manage_testimonials'],
  'Site Configuration': ['manage_site_settings', 'manage_seo', 'manage_analytics'],
  'User Management': ['manage_users', 'manage_roles'],
  'Content Operations': ['manage_events', 'manage_lifestyle_gallery', 'manage_poi'],
  'Advanced Features': ['manage_ai_tools', 'manage_integrations', 'view_analytics'],
  'System Management': ['manage_work_orders', 'manage_tasks'],
};

export const permissionLabels: Record<keyof UserPermissions, string> = {
  manage_blog: 'Manage Blog Posts',
  manage_pages: 'Manage Pages',
  manage_properties: 'Manage Properties',
  manage_testimonials: 'Manage Testimonials',
  manage_site_settings: 'Manage Site Settings',
  manage_seo: 'Manage SEO Settings',
  manage_analytics: 'Manage Analytics',
  manage_users: 'Manage Users',
  manage_roles: 'Manage Roles & Permissions',
  manage_events: 'Manage Events',
  manage_lifestyle_gallery: 'Manage Lifestyle Gallery',
  manage_poi: 'Manage Points of Interest',
  manage_ai_tools: 'Manage AI Tools',
  manage_integrations: 'Manage Integrations',
  view_analytics: 'View Analytics Dashboard',
  manage_work_orders: 'Manage Work Orders',
  manage_tasks: 'Manage Tasks',
};

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  permissions: UserPermissions;
  created_at: string;
  updated_at: string;
}

export const useUserPermissions = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data.map(user => ({
        ...user,
        permissions: { ...defaultPermissions, ...user.permissions }
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserPermissions = async (userId: string, permissions: Partial<UserPermissions>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ permissions })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, permissions: { ...user.permissions, ...permissions } }
          : user
      ));

      toast({
        title: "Success",
        description: "User permissions updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role } : user
      ));

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    updateUserPermissions,
    updateUserRole,
  };
};
