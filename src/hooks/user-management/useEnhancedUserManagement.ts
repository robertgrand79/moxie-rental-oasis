
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EnhancedUser {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

interface SystemRole {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  is_active: boolean;
}

export const useEnhancedUserManagement = () => {
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<SystemRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAvailableRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_roles')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if current user is admin
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Error checking user role:', profileError);
        setError('Failed to verify admin access');
        return;
      }

      if (currentUserProfile?.role !== 'admin') {
        setError('Access denied: Admin privileges required');
        return;
      }

      // Fetch all users from profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError(profilesError.message);
        return;
      }

      // For each user, fetch their roles from the new system
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          try {
            // Fetch roles from new system
            const { data: userRolesData, error: rolesError } = await supabase
              .from('user_roles')
              .select(`
                role:system_roles(
                  id,
                  name,
                  description
                )
              `)
              .eq('user_id', profile.id)
              .eq('is_active', true);

            let roles = [];

            if (rolesError) {
              console.warn(`Error fetching roles for user ${profile.id}:`, rolesError);
            } else if (userRolesData && userRolesData.length > 0) {
              // Use new role system
              roles = userRolesData
                .map(ur => ur.role)
                .filter(role => role !== null);
            }

            // Fallback to old role system if no roles found in new system
            if (roles.length === 0 && profile.role) {
              // Create a mock role object based on the old system
              roles = [{
                id: `legacy-${profile.role}`,
                name: profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
                description: `Legacy ${profile.role} role`
              }];
            }

            // If still no roles, assign default User role
            if (roles.length === 0) {
              roles = [{
                id: 'default-user',
                name: 'User',
                description: 'Default user role'
              }];
            }

            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              status: profile.status,
              last_login_at: profile.last_login_at,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              roles: roles
            };
          } catch (err) {
            console.error(`Error processing user ${profile.id}:`, err);
            // Return user with default role on error
            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              status: profile.status,
              last_login_at: profile.last_login_at,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              roles: [{
                id: 'error-default',
                name: 'User',
                description: 'Default role (error fallback)'
              }]
            };
          }
        })
      );

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateUserProfile = async (userId: string, updates: any) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User profile updated successfully',
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user profile',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignRoleToUser = async (userId: string, roleId: string) => {
    try {
      setLoading(true);

      // Check if it's a legacy role ID
      if (roleId.startsWith('legacy-') || roleId.startsWith('default-') || roleId.startsWith('error-')) {
        toast({
          title: 'Error',
          description: 'Cannot assign legacy or system-generated roles',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: user?.id
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role assigned successfully',
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign role',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeRoleFromUser = async (userId: string, roleId: string) => {
    try {
      setLoading(true);

      // Check if it's a legacy role ID
      if (roleId.startsWith('legacy-') || roleId.startsWith('default-') || roleId.startsWith('error-')) {
        toast({
          title: 'Error',
          description: 'Cannot remove legacy or system-generated roles',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role removed successfully',
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (invitation: { email: string; roleId: string; full_name?: string }) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_invitations')
        .insert({
          email: invitation.email,
          role: 'user', // Legacy field for compatibility
          full_name: invitation.full_name,
          invited_by: user?.id,
          invitation_token: crypto.randomUUID()
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Invitation sent to ${invitation.email}`,
      });

      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = (query: string) => {
    if (!query.trim()) {
      return users;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(lowercaseQuery) ||
      (user.full_name && user.full_name.toLowerCase().includes(lowercaseQuery)) ||
      user.roles.some(role => role.name.toLowerCase().includes(lowercaseQuery))
    );
  };

  useEffect(() => {
    if (user) {
      fetchAvailableRoles();
      fetchUsers();
    }
  }, [user, fetchAvailableRoles, fetchUsers]);

  return {
    users,
    availableRoles,
    loading,
    error,
    fetchUsers,
    updateUserProfile,
    assignRoleToUser,
    removeRoleFromUser,
    inviteUser,
    searchUsers
  };
};
