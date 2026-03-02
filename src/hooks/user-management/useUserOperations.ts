
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import type { 
  UserProfileUpdate, 
  UserInvitation, 
  UserRole,
  isEdgeFunctionError 
} from '@/types/user-operations';
import { isEdgeFunctionError as checkEdgeFunctionError } from '@/types/user-operations';

export const useUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();

  const updateUserProfile = async (userId: string, updates: UserProfileUpdate): Promise<boolean> => {
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

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      setLoading(true);

      // Update legacy role system first
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Also update organization_members role (admin/member mapping)
      if (organization?.id) {
        const orgRole = newRole === 'admin' ? 'admin' : 'member';
        const { error: orgMemberError } = await supabase
          .from('organization_members')
          .update({ role: orgRole })
          .eq('user_id', userId)
          .eq('organization_id', organization.id);

        if (orgMemberError) {
          console.warn('Could not update organization member role:', orgMemberError);
        }
      }

      // Try to update new role system if it exists
      try {
        // Get the role ID for the new role
        const { data: roleData, error: roleError } = await supabase
          .from('system_roles')
          .select('id')
          .eq('name', newRole === 'admin' ? 'Admin' : 'User')
          .single();

        if (!roleError && roleData) {
          // Remove existing roles
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);

          // Add new role
          await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role_id: roleData.id,
              assigned_by: user?.id
            });
        }
      } catch (newRoleError) {
        console.warn('Could not update new role system:', newRoleError);
        // Continue - legacy system update succeeded
      }

      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!organization?.id) {
        throw new Error('Organization context required');
      }
      
      // Use the edge function for actual deletion with organization context
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId, organizationId: organization.id }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (invitation: UserInvitation): Promise<boolean> => {
    try {
      setLoading(true);

      if (!organization?.id) {
        throw new Error('Organization context required');
      }

      // Use the edge function for invitation with organization context
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: invitation.email,
          full_name: invitation.full_name,
          role: invitation.role,
          team_role: invitation.team_role,
          organizationId: organization.id
        }
      });

      if (error) {
        // Extract the actual error message from the Supabase error
        // Format is typically: "Edge function returned 400: Error, {"error":"..."}"
        let errorMessage = 'Failed to invite user';
        try {
          const jsonMatch = error.message?.match(/\{.*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            errorMessage = parsed.error || errorMessage;
          }
        } catch {
          // Use default message if parsing fails
        }
        throw new Error(errorMessage);
      }

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: invitation.email,
          full_name: invitation.full_name,
          role: invitation.role,
          invitedBy: user?.id,
          invitationToken: data?.invitation_id,
          organizationId: organization.id
        }
      });

      if (emailError) {
        console.warn('Failed to send invitation email:', emailError);
        toast({
          title: 'Partial Success',
          description: `Invitation created for ${invitation.email}, but email failed to send. The user can still be invited manually.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `Invitation email sent to ${invitation.email}`,
        });
      }

      return true;
    } catch (error: unknown) {
      console.error('Error inviting user:', error);
      
      const errorMessage = checkEdgeFunctionError(error) 
        ? error.message || 'Failed to invite user'
        : 'Failed to invite user';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateUserRoles = async (userIds: string[], newRole: UserRole): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Update multiple users
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .in('id', userIds);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Updated ${userIds.length} users to ${newRole} role`,
      });

      return true;
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user roles',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUserProfile,
    updateUserRole,
    deleteUser,
    deactivateUser,
    inviteUser,
    bulkUpdateUserRoles,
    loading
  };
};
