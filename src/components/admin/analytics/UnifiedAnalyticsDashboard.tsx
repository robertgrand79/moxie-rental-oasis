import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity, TrendingUp, Users } from 'lucide-react';
import ContentPerformanceTab from './ContentPerformanceTab';
import SiteHealthTab from './SiteHealthTab';
import MarketingEngagementTab from './MarketingEngagementTab';
import RealTimeMonitoringTab from './RealTimeMonitoringTab';

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Content & AI Performance
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Site Performance & Health
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Marketing & Engagement
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Real-time Monitoring
          </TabsTrigger>
        </TabsList>

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