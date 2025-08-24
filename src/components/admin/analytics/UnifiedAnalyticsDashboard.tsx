import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity, TrendingUp, Users } from 'lucide-react';
import ContentPerformanceTab from './ContentPerformanceTab';
import SiteHealthTab from './SiteHealthTab';
import MarketingEngagementTab from './MarketingEngagementTab';
import RealTimeMonitoringTab from './RealTimeMonitoringTab';
import AnalyticsStatusIndicator from './AnalyticsStatusIndicator';
import SecurityStatusIndicator from './SecurityStatusIndicator';

const UnifiedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('content');

  // Listen for reset event from navigation
  useEffect(() => {
    const handleReset = () => {
      // Reset to content tab and trigger refresh for active tab
      setActiveTab('content');
      window.dispatchEvent(new CustomEvent('resetContentAnalytics'));
    };

    window.addEventListener('resetAnalyticsDashboard', handleReset);
    return () => window.removeEventListener('resetAnalyticsDashboard', handleReset);
  }, []);

  return (
    <div className="space-y-6">
      <AnalyticsStatusIndicator />
      <SecurityStatusIndicator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-background/60 backdrop-blur-sm p-1 shadow-sm border min-w-full">
            <TabsTrigger value="content" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted min-w-fit">
              <BarChart3 className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Content & AI Performance</span>
              <span className="sm:hidden">Content</span>
            </TabsTrigger>
            <TabsTrigger value="site" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted min-w-fit">
              <Activity className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Site Performance & Health</span>
              <span className="sm:hidden">Site</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted min-w-fit">
              <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Marketing & Engagement</span>
              <span className="sm:hidden">Marketing</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted min-w-fit">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Real-time Monitoring</span>
              <span className="sm:hidden">Real-time</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content" className="space-y-6">
          <ContentPerformanceTab />
        </TabsContent>

        <TabsContent value="site" className="space-y-6">
          <SiteHealthTab />
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <MarketingEngagementTab />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeMonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;