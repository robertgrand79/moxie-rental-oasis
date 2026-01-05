import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

interface AnalyticsData {
  totalCampaigns: number;
  totalSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  recentActivity: Array<{
    id: string;
    event_type: string;
    subscriber_email: string;
    created_at: string;
    campaign_id: string;
  }>;
  campaignPerformance: Array<{
    id: string;
    subject: string;
    sent_at: string;
    recipient_count: number;
    open_rate: number;
    click_rate: number;
    total_opens: number;
    total_clicks: number;
  }>;
  topPerformers: Array<{
    id: string;
    subject: string;
    open_rate: number;
    click_rate: number;
  }>;
}

export const useNewsletterAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useCurrentOrganization();

  const fetchAnalyticsData = async () => {
    if (!organization?.id) {
      setAnalyticsData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch campaigns with analytics data
      const { data: campaigns, error: campaignsError } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .eq('organization_id', organization.id)
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Fetch recent activity
      const { data: recentActivity, error: activityError } = await supabase
        .from('newsletter_analytics')
        .select(`
          id,
          event_type,
          subscriber_email,
          created_at,
          campaign_id
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activityError) throw activityError;

      // Calculate aggregate statistics
      const totalCampaigns = campaigns?.length || 0;
      const totalSent = campaigns?.reduce((sum, c) => sum + (c.recipient_count || 0), 0) || 0;
      const avgOpenRate = campaigns?.length > 0 
        ? campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length 
        : 0;
      const avgClickRate = campaigns?.length > 0 
        ? campaigns.reduce((sum, c) => sum + (c.click_rate || 0), 0) / campaigns.length 
        : 0;

      // Get top performers
      const topPerformers = campaigns
        ?.filter(c => c.open_rate > 0)
        .sort((a, b) => (b.open_rate || 0) - (a.open_rate || 0))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          subject: c.subject,
          open_rate: c.open_rate || 0,
          click_rate: c.click_rate || 0,
        })) || [];

      setAnalyticsData({
        totalCampaigns,
        totalSent,
        averageOpenRate: avgOpenRate,
        averageClickRate: avgClickRate,
        recentActivity: recentActivity || [],
        campaignPerformance: campaigns || [],
        topPerformers,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching newsletter analytics:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [organization?.id]);

  return {
    analyticsData,
    loading,
    error,
    refetch: fetchAnalyticsData,
  };
};
