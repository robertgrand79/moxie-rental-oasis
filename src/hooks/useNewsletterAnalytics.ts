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

      // Aggregate stats. Previously this averaged stored open_rate / click_rate
      // percentages across campaigns — which broke spectacularly when a single
      // campaign's stored rate exceeded 100 (e.g. test sends to one recipient
      // that opened on multiple devices showed "300% opens"). The fix has two
      // parts: compute the aggregate from total_opens/total_clicks against
      // total recipients (a true weighted rate), and clamp any per-campaign or
      // aggregate rate to [0, 100] as a defence against stale rows still
      // carrying bad data from before track-newsletter-open was fixed.
      const clampRate = (n: number | null | undefined) =>
        Math.max(0, Math.min(100, Number(n) || 0));

      const totalCampaigns = campaigns?.length || 0;
      const totalSent = campaigns?.reduce((sum, c) => sum + (c.recipient_count || 0), 0) || 0;
      const totalOpens = campaigns?.reduce((sum, c) => sum + (c.total_opens || 0), 0) || 0;
      const totalClicks = campaigns?.reduce((sum, c) => sum + (c.total_clicks || 0), 0) || 0;
      const avgOpenRate = totalSent > 0 ? clampRate((totalOpens / totalSent) * 100) : 0;
      const avgClickRate = totalSent > 0 ? clampRate((totalClicks / totalSent) * 100) : 0;

      const topPerformers = campaigns
        ?.map(c => ({ ...c, open_rate: clampRate(c.open_rate), click_rate: clampRate(c.click_rate) }))
        .filter(c => c.open_rate > 0)
        .sort((a, b) => b.open_rate - a.open_rate)
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          subject: c.subject,
          open_rate: c.open_rate,
          click_rate: c.click_rate,
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
