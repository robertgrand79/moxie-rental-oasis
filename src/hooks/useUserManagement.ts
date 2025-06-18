import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserInvitation {
  email: string;
  role: string;
  full_name?: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if current user is admin first
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

      // Fetch all users with their roles from the new system
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role:system_roles(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
        return;
      }

      // Format users data to include role information from new system
      const formattedUsers = (data || []).map(userProfile => {
        // Get the primary role (first active role)
        const primaryRole = userProfile.user_roles?.[0]?.role?.name || userProfile.role || 'user';
        
        return {
          ...userProfile,
          role: primaryRole
        };
      });

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<User>) => {
    try {
      // Update basic profile information
      const profileUpdates = { ...updates };
      delete profileUpdates.role; // Remove role from profile updates

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating user profile:', profileError);
          toast({
            title: 'Error',
            description: 'Failed to update user profile',
            variant: 'destructive',
          });
          return false;
        }
      }

      // Handle role updates through the new system
      if (updates.role) {
        await updateUserRole(userId, updates.role);
      }

      toast({
        title: 'Success',
        description: 'User profile updated successfully',
      });
      
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Unexpected error updating user profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user profile',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Get the role ID from the system_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('system_roles')
        .select('id')
        .eq('name', newRole)
        .single();

      if (roleError || !roleData) {
        console.error('Error finding role:', roleError);
        toast({
          title: 'Error',
          description: 'Role not found',
          variant: 'destructive',
        });
        return false;
      }

      // Remove existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Assign the new role
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id,
          assigned_by: user?.id
        });

      if (assignError) {
        console.error('Error assigning role:', assignError);
        toast({
          title: 'Error',
          description: 'Failed to assign role',
          variant: 'destructive',
        });
        return false;
      }

      // Also update the legacy role field in profiles for backward compatibility
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      // Log the action
      await supabase
        .from('permission_audit_logs')
        .insert({
          action: 'user_role_changed',
          target_type: 'user',
          target_id: userId,
          performed_by: user?.id,
          details: { new_role: newRole }
        });

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Unexpected error updating user role:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Unexpected error deleting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
      return false;
    }
  };

  const inviteUser = async (invitation: UserInvitation) => {
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: invitation
      });

      if (error) {
        console.error('Error inviting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to send invitation',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Success',
        description: `Invitation sent to ${invitation.email}`,
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected error inviting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
      return false;
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
      user.role.toLowerCase().includes(lowercaseQuery)
    );
  };

  const bulkUpdateUserRoles = async (userIds: string[], newRole: string) => {
    try {
      // Update each user's role
      const results = await Promise.all(
        userIds.map(userId => updateUserRole(userId, newRole))
      );

      const successCount = results.filter(Boolean).length;
      
      if (successCount === userIds.length) {
        toast({
          title: 'Success',
          description: `Updated ${successCount} users to ${newRole} role`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Updated ${successCount} of ${userIds.length} users`,
          variant: 'destructive',
        });
      }
      
      await fetchUsers(); // Refresh the list
      return successCount === userIds.length;
    } catch (err) {
      console.error('Unexpected error bulk updating user roles:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user roles',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserProfile,
    updateUserRole,
    deleteUser,
    inviteUser,
    searchUsers,
    bulkUpdateUserRoles,
  };
};
