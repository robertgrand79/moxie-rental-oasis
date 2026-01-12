import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreateOrganizationData, 
  UpdateOrganizationData,
  InviteOrganizationMemberData 
} from '@/types/organizations';

export const useOrganizationOperations = () => {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const createOrganization = async (data: CreateOrganizationData, userId: string) => {
    setCreating(true);
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          slug: data.slug,
          logo_url: data.logo_url,
          website: data.website,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Update profile with organization_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: org.id })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Automatically provision subdomain via Cloudflare
      try {
        const { error: provisionError } = await supabase.functions.invoke('provision-subdomain', {
          body: {
            organization_id: org.id,
            slug: data.slug,
          },
        });

        if (provisionError) {
          console.error('Subdomain provisioning failed:', provisionError);
          // Don't throw - org creation succeeded, subdomain can be retried
        }
      } catch (provisionErr) {
        console.error('Subdomain provisioning error:', provisionErr);
        // Non-blocking - org creation still succeeds
      }

      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });

      return org;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create organization',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const updateOrganization = async (orgId: string, data: UpdateOrganizationData) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update organization',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const inviteMember = async (orgId: string, data: InviteOrganizationMemberData) => {
    try {
      // Call edge function to invite user
      const { data: result, error } = await supabase.functions.invoke('invite-organization-member', {
        body: {
          organizationId: orgId,
          email: data.email,
          role: data.role,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Member invited successfully',
      });

      return result;
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to invite member',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update member role',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    createOrganization,
    updateOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    creating,
    updating,
  };
};
