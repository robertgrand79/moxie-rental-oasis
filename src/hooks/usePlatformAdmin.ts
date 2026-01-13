import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type TemplateType = 'single_property' | 'multi_property';

export interface PlatformOrganization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  custom_domain: string | null;
  is_active: boolean;
  is_template: boolean;
  is_template_source: boolean;
  template_type: TemplateType;
  template_category: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  subscription_status: string | null;
  subscription_tier: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  archived_by: string | null;
  archive_reason: string | null;
  subdomain_status: string | null;
  subdomain_error: string | null;
  member_count?: number;
  property_count?: number;
}

export interface PlatformStats {
  totalOrganizations: number;
  activeOrganizations: number;
  archivedOrganizations: number;
  totalUsers: number;
  totalProperties: number;
  totalReservations: number;
  recentReservations: number;
}

export const usePlatformAdmin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);

  // Check if current user is platform admin
  const { data: isPlatformAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['is-platform-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Fetch all organizations with counts
  const { data: organizations, isLoading: loadingOrgs, refetch: refetchOrgs } = useQuery({
    queryKey: ['platform-organizations', showArchived],
    queryFn: async () => {
      let query = supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on archived status
      if (showArchived) {
        query = query.not('archived_at', 'is', null);
      } else {
        query = query.is('archived_at', null);
      }

      const { data: orgs, error } = await query;

      if (error) throw error;

      // Get member counts
      const { data: memberCounts } = await supabase
        .from('organization_members')
        .select('organization_id');

      // Get property counts
      const { data: propertyCounts } = await supabase
        .from('properties')
        .select('organization_id');

      // Calculate counts per organization
      return (orgs || []).map(org => ({
        ...org,
        member_count: memberCounts?.filter(m => m.organization_id === org.id).length || 0,
        property_count: propertyCounts?.filter(p => p.organization_id === org.id).length || 0,
      })) as PlatformOrganization[];
    },
    enabled: isPlatformAdmin === true,
  });

  // Fetch platform-wide stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async (): Promise<PlatformStats> => {
      const [orgsResult, usersResult, propsResult, reservationsResult, recentReservationsResult] = await Promise.all([
        supabase.from('organizations').select('id, is_active, archived_at'),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('properties').select('id', { count: 'exact' }),
        supabase.from('property_reservations').select('id', { count: 'exact' }),
        supabase.from('property_reservations')
          .select('id', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const activeOrgs = orgsResult.data?.filter(o => o.is_active && !o.archived_at) || [];
      const archivedOrgs = orgsResult.data?.filter(o => o.archived_at) || [];

      return {
        totalOrganizations: orgsResult.data?.length || 0,
        activeOrganizations: activeOrgs.length,
        archivedOrganizations: archivedOrgs.length,
        totalUsers: usersResult.count || 0,
        totalProperties: propsResult.count || 0,
        totalReservations: reservationsResult.count || 0,
        recentReservations: recentReservationsResult.count || 0,
      };
    },
    enabled: isPlatformAdmin === true,
  });

  // Toggle organization active status
  const toggleOrgStatus = useMutation({
    mutationFn: async ({ orgId, isActive }: { orgId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('organizations')
        .update({ is_active: isActive })
        .eq('id', orgId);

      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      toast.success(`Organization ${isActive ? 'activated' : 'deactivated'}`);
    },
    onError: (error) => {
      toast.error('Failed to update organization status');
      console.error(error);
    },
  });

  // Toggle organization template status
  const toggleTemplateStatus = useMutation({
    mutationFn: async ({ orgId, isTemplate }: { orgId: string; isTemplate: boolean }) => {
      const { error } = await supabase
        .from('organizations')
        .update({ is_template: isTemplate })
        .eq('id', orgId);

      if (error) throw error;
    },
    onSuccess: (_, { isTemplate }) => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['template-organizations'] });
      toast.success(`Organization ${isTemplate ? 'marked as template' : 'unmarked as template'}`);
    },
    onError: (error) => {
      toast.error('Failed to update template status');
      console.error(error);
    },
  });

  // Update organization template type
  const updateTemplateType = useMutation({
    mutationFn: async ({ orgId, templateType }: { orgId: string; templateType: TemplateType }) => {
      const { error } = await supabase
        .from('organizations')
        .update({ template_type: templateType })
        .eq('id', orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['template-organizations'] });
      toast.success('Template type updated');
    },
    onError: (error) => {
      toast.error('Failed to update template type');
      console.error(error);
    },
  });

  // Archive organization
  const archiveOrganization = useMutation({
    mutationFn: async ({ orgId, reason }: { orgId: string; reason?: string }) => {
      const { error } = await supabase
        .from('organizations')
        .update({
          archived_at: new Date().toISOString(),
          archived_by: user?.id,
          archive_reason: reason || 'manual',
        })
        .eq('id', orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      toast.success('Organization archived');
    },
    onError: (error) => {
      toast.error('Failed to archive organization');
      console.error(error);
    },
  });

  // Restore organization from archive
  const restoreOrganization = useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase
        .from('organizations')
        .update({
          archived_at: null,
          archived_by: null,
          archive_reason: null,
        })
        .eq('id', orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      toast.success('Organization restored');
    },
    onError: (error) => {
      toast.error('Failed to restore organization');
      console.error(error);
    },
  });

  // Delete organization and its users
  const deleteOrganization = useMutation({
    mutationFn: async (orgId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-organization', {
        body: { organizationId: orgId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      const msg = data?.deletedUsers > 0 
        ? `Organization and ${data.deletedUsers} user(s) deleted`
        : 'Organization deleted';
      toast.success(msg);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete organization');
      console.error(error);
    },
  });

  return {
    isPlatformAdmin,
    checkingAdmin,
    organizations,
    loadingOrgs,
    refetchOrgs,
    stats,
    loadingStats,
    showArchived,
    setShowArchived,
    toggleOrgStatus: toggleOrgStatus.mutate,
    toggleTemplateStatus: toggleTemplateStatus.mutate,
    updateTemplateType: updateTemplateType.mutate,
    archiveOrganization: archiveOrganization.mutate,
    restoreOrganization: restoreOrganization.mutate,
    deleteOrganization: deleteOrganization.mutate,
    isUpdating: toggleOrgStatus.isPending || toggleTemplateStatus.isPending || updateTemplateType.isPending || archiveOrganization.isPending || restoreOrganization.isPending || deleteOrganization.isPending,
  };
};
