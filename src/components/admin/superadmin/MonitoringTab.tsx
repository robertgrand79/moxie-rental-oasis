import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import ErrorLogsTable from '../monitoring/ErrorLogsTable';
import HealthStatusPanel from '../monitoring/HealthStatusPanel';
import AnalyticsEventsFeed from '../monitoring/AnalyticsEventsFeed';
import ConversionFunnelChart from '../monitoring/ConversionFunnelChart';
import PlatformMetricsCards from '../monitoring/PlatformMetricsCards';

const MonitoringTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Platform Metrics Overview */}
      <PlatformMetricsCards />

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Error Logs
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="funnels" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Conversion Funnels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <HealthStatusPanel />
        </TabsContent>

        <TabsContent value="errors" className="mt-6">
          <ErrorLogsTable showAllTenants />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <AnalyticsEventsFeed showAllTenants />
        </TabsContent>

        <TabsContent value="funnels" className="mt-6">
          <ConversionFunnelChart showAllTenants />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringTab;
