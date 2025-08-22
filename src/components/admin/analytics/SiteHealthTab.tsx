import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
import SiteMetricsDashboard from '../SiteMetricsDashboard';

const SiteHealthTab = () => {
  const { refreshData } = useRealAnalytics();

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      window.dispatchEvent(new CustomEvent('resetSiteMetricsDashboard'));
      refreshData();
    };

    window.addEventListener('resetSiteHealth', handleReset);
    return () => window.removeEventListener('resetSiteHealth', handleReset);
  }, [refreshData]);

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('resetSiteMetricsDashboard'));
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Site Performance & Health</h2>
          <p className="text-muted-foreground">
            Monitor website performance, uptime, Core Web Vitals, and system health metrics
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Metrics
        </Button>
      </div>

      {/* Site Metrics Dashboard */}
      <SiteMetricsDashboard />
    </div>
  );
};

export default SiteHealthTab;