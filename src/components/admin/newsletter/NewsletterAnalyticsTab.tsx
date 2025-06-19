
import React from 'react';
import { useNewsletterAnalytics } from '@/hooks/useNewsletterAnalytics';
import AnalyticsOverviewCards from './AnalyticsOverviewCards';
import AnalyticsCharts from './AnalyticsCharts';
import TopPerformersTable from './TopPerformersTable';
import RecentActivityFeed from './RecentActivityFeed';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewsletterAnalyticsTab = () => {
  const { analyticsData, loading, error, refetch } = useNewsletterAnalytics();

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load analytics data: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={refetch} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (loading || !analyticsData) {
    return (
      <div className="space-y-6">
        <AnalyticsOverviewCards
          totalCampaigns={0}
          totalSent={0}
          averageOpenRate={0}
          averageClickRate={0}
          loading={true}
        />
        <AnalyticsCharts campaignPerformance={[]} loading={true} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPerformersTable topPerformers={[]} loading={true} />
          <RecentActivityFeed recentActivity={[]} loading={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Analytics</h2>
          <p className="text-muted-foreground">
            Track the performance of your newsletter campaigns
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <AnalyticsOverviewCards
        totalCampaigns={analyticsData.totalCampaigns}
        totalSent={analyticsData.totalSent}
        averageOpenRate={analyticsData.averageOpenRate}
        averageClickRate={analyticsData.averageClickRate}
      />

      <AnalyticsCharts campaignPerformance={analyticsData.campaignPerformance} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformersTable topPerformers={analyticsData.topPerformers} />
        <RecentActivityFeed recentActivity={analyticsData.recentActivity} />
      </div>
    </div>
  );
};

export default NewsletterAnalyticsTab;
