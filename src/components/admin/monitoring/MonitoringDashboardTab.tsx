import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertCircle, TrendingUp } from 'lucide-react';
import ErrorLogsTable from './ErrorLogsTable';
import HealthStatusPanel from './HealthStatusPanel';
import AnalyticsEventsFeed from './AnalyticsEventsFeed';
import ConversionFunnelChart from './ConversionFunnelChart';

const MonitoringDashboardTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Health Overview at top */}
      <HealthStatusPanel />

      {/* Detailed sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Error Logs */}
        <ErrorLogsTable />
        
        {/* Activity Feed */}
        <AnalyticsEventsFeed />
      </div>

      {/* Conversion Funnels */}
      <ConversionFunnelChart />
    </div>
  );
};

export default MonitoringDashboardTab;
