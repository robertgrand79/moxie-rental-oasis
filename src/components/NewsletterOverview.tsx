
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, TrendingUp, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterOverviewProps {
  subscriberCount: number | null;
}

const NewsletterOverview = ({ subscriberCount }: NewsletterOverviewProps) => {
  const { data: subscriberStats } = useQuery({
    queryKey: ['newsletter-subscriber-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('is_active, subscribed_at');
      
      if (error) throw error;
      
      const activeCount = data.filter(sub => sub.is_active).length;
      const totalCount = data.length;
      
      // Calculate recent subscriptions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCount = data.filter(sub => 
        new Date(sub.subscribed_at) > thirtyDaysAgo
      ).length;

      return {
        activeCount,
        totalCount,
        recentCount,
        inactiveCount: totalCount - activeCount
      };
    },
  });

  const { data: campaignStats } = useQuery({
    queryKey: ['newsletter-campaign-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('sent_at, recipient_count');
      
      if (error) throw error;
      
      const totalCampaigns = data.length;
      const totalRecipients = data.reduce((sum, campaign) => sum + (campaign.recipient_count || 0), 0);
      
      return {
        totalCampaigns,
        totalRecipients
      };
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {subscriberStats?.activeCount ?? subscriberCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Ready to receive newsletters
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subscriberStats?.totalCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            All-time subscribers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {subscriberStats?.recentCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {campaignStats?.totalCampaigns ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Newsletter campaigns
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterOverview;
