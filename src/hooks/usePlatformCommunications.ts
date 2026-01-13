import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'announcement' | 'campaign' | 'banner';
  target_tiers: string[];
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  banner_style: 'info' | 'warning' | 'success' | 'error';
  cta_text: string | null;
  cta_url: string | null;
  email_subject: string | null;
  email_sent_at: string | null;
  email_sent_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  announcement_type: 'announcement' | 'campaign' | 'banner';
  target_tiers: string[];
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  banner_style?: 'info' | 'warning' | 'success' | 'error';
  cta_text?: string;
  cta_url?: string;
  email_subject?: string;
}

export function usePlatformCommunications() {
  const queryClient = useQueryClient();

  const announcementsQuery = useQuery({
    queryKey: ['platform-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PlatformAnnouncement[];
    },
  });

  const tierStatsQuery = useQuery({
    queryKey: ['platform-tier-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('subscription_tier');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((org) => {
        const tier = org.subscription_tier || 'unknown';
        counts[tier] = (counts[tier] || 0) + 1;
      });
      return counts;
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (input: CreateAnnouncementInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('platform_announcements')
        .insert({ ...input, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-announcements'] });
      toast.success('Announcement created');
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const updateAnnouncement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlatformAnnouncement> & { id: string }) => {
      const { error } = await supabase
        .from('platform_announcements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-announcements'] });
      toast.success('Announcement updated');
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-announcements'] });
      toast.success('Announcement deleted');
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const sendCampaignEmail = useMutation({
    mutationFn: async (announcementId: string) => {
      const { data, error } = await supabase.functions.invoke('send-platform-campaign', {
        body: { announcementId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-announcements'] });
      toast.success(`Campaign sent to ${data.sent_count} organizations`);
    },
    onError: (error) => toast.error(`Failed to send: ${error.message}`),
  });

  return {
    announcements: announcementsQuery.data ?? [],
    tierStats: tierStatsQuery.data ?? {},
    isLoading: announcementsQuery.isLoading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    sendCampaignEmail,
  };
}
