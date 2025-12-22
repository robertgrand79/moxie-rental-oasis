import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix';

export interface BugReport {
  id: string;
  organization_id: string | null;
  reported_by: string | null;
  title: string;
  description: string;
  page_url: string | null;
  browser_info: string | null;
  severity: BugSeverity;
  status: BugStatus;
  admin_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  organization?: {
    name: string;
    slug: string;
  };
  reporter?: {
    full_name: string;
    email: string;
  };
  resolver?: {
    full_name: string;
  };
}

export interface CreateBugReportInput {
  title: string;
  description: string;
  severity: BugSeverity;
  page_url?: string;
  browser_info?: string;
}

export interface UpdateBugReportInput {
  id: string;
  status?: BugStatus;
  admin_notes?: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export const useBugReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organization } = useCurrentOrganization();

  // Fetch bug reports for current organization
  const { data: orgBugReports, isLoading: loadingOrgReports } = useQuery({
    queryKey: ['bug-reports', 'org', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('bug_reports')
        .select(`
          *,
          reporter:profiles!bug_reports_reported_by_fkey(full_name, email)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BugReport[];
    },
    enabled: !!organization?.id,
  });

  // Fetch all bug reports (for platform admins)
  const { data: allBugReports, isLoading: loadingAllReports, refetch: refetchAllReports } = useQuery({
    queryKey: ['bug-reports', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bug_reports')
        .select(`
          *,
          organization:organizations(name, slug),
          reporter:profiles!bug_reports_reported_by_fkey(full_name, email),
          resolver:profiles!bug_reports_resolved_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BugReport[];
    },
  });

  // Submit a bug report
  const submitBugReport = useMutation({
    mutationFn: async (input: CreateBugReportInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!organization?.id) throw new Error('No organization context');

      const { data, error } = await supabase
        .from('bug_reports')
        .insert({
          organization_id: organization.id,
          reported_by: user.id,
          title: input.title,
          description: input.description,
          severity: input.severity,
          page_url: input.page_url || null,
          browser_info: input.browser_info || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Bug Report Submitted',
        description: 'Thank you for your feedback. Our team will review it shortly.',
      });
      queryClient.invalidateQueries({ queryKey: ['bug-reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit bug report',
        variant: 'destructive',
      });
    },
  });

  // Update a bug report (for platform admins)
  const updateBugReport = useMutation({
    mutationFn: async (input: UpdateBugReportInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('bug_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Bug Report Updated',
        description: 'The bug report has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['bug-reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update bug report',
        variant: 'destructive',
      });
    },
  });

  // Delete a bug report (for platform admins)
  const deleteBugReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bug_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Bug Report Deleted',
        description: 'The bug report has been deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['bug-reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete bug report',
        variant: 'destructive',
      });
    },
  });

  // Get stats for platform admins
  const bugStats = allBugReports ? {
    total: allBugReports.length,
    open: allBugReports.filter(b => b.status === 'open').length,
    inProgress: allBugReports.filter(b => b.status === 'in_progress').length,
    critical: allBugReports.filter(b => b.severity === 'critical' && b.status !== 'resolved' && b.status !== 'closed').length,
    resolved: allBugReports.filter(b => b.status === 'resolved').length,
  } : null;

  return {
    // Organization bug reports
    orgBugReports,
    loadingOrgReports,
    
    // All bug reports (platform admin)
    allBugReports,
    loadingAllReports,
    refetchAllReports,
    
    // Mutations
    submitBugReport,
    updateBugReport,
    deleteBugReport,
    
    // Stats
    bugStats,
  };
};
