
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Zap,
  RefreshCw,
  Info,
  BarChart3,
  Users,
  AlertTriangle,
  Clock,
  Loader2
} from 'lucide-react';
import ErrorDetailsModal from '@/components/admin/ErrorDetailsModal';
import { useErrorTracking } from '@/hooks/useErrorTracking';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
import MetricCard from './metrics/MetricCard';
import RealTimeActivityCard from './metrics/RealTimeActivityCard';
import CoreWebVitalsCard from './metrics/CoreWebVitalsCard';
import SystemStatusCard from './metrics/SystemStatusCard';
import MetricsLoadingState from './metrics/MetricsLoadingState';

const SiteMetricsDashboard = () => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { 
    analyticsData, 
    performanceMetrics, 
    systemHealth, 
    realTimeVisitors,
    loading, 
    isDemo, 
    gaInitializing,
    refreshData 
  } = useRealAnalytics();

  const { 
    errors, 
    resolveError, 
    acknowledgeError, 
    getActiveErrorCount, 
    getCriticalErrorCount 
  } = useErrorTracking();

  const getLoadTimeStatus = (loadTime: number) => {
    if (loadTime < 1500) return 'good';
    if (loadTime < 3000) return 'warning';
    return 'error';
  };

  const getErrorStatus = (errorCount: number) => {
    if (errorCount === 0) return 'good';
    if (errorCount < 5) return 'warning';
    return 'error';
  };

  const activeErrorCount = getActiveErrorCount();
  const criticalErrorCount = getCriticalErrorCount();

  if (loading) {
    return <MetricsLoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Performance Metrics</h2>
          <p className="text-gray-600 flex items-center gap-2">
            {isDemo ? 'Demo analytics data' : 'Real-time monitoring'} of your website's health and performance
            {gaInitializing && (
              <span className="flex items-center gap-1 text-sm text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Initializing GA...
              </span>
            )}
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={loading || gaInitializing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(loading || gaInitializing) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isDemo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            These are demo metrics. Google Analytics is configured but may still be loading.
            {gaInitializing ? (
              <span className="block mt-1 text-sm text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                Waiting for Google Analytics to initialize...
              </span>
            ) : (
              <>
                Try refreshing the page or clicking the refresh button above.
                <Button variant="link" className="p-0 h-auto ml-2" asChild>
                  <a href="/admin/settings">Check Analytics Settings</a>
                </Button>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Site Uptime"
          value={`${systemHealth?.uptime || 99.9}%`}
          description="Last 30 days availability"
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
          status={systemHealth?.uptime && systemHealth.uptime > 99 ? 'good' : 'warning'}
          trend="up"
          isDemo={isDemo}
        />
        
        <MetricCard
          title="Page Load Speed"
          value={`${((performanceMetrics?.loadTime || 1200) / 1000).toFixed(1)}s`}
          description="Average load time"
          icon={<Zap className="h-4 w-4 text-blue-600" />}
          status={getLoadTimeStatus(performanceMetrics?.loadTime || 1200)}
          isDemo={isDemo}
        />
        
        <MetricCard
          title="Active Errors"
          value={activeErrorCount}
          description={`${criticalErrorCount} critical errors detected`}
          icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
          status={getErrorStatus(activeErrorCount)}
          onClick={() => setIsErrorModalOpen(true)}
          clickable={true}
          isDemo={isDemo}
        />
        
        <MetricCard
          title="Daily Visitors"
          value={analyticsData?.visitors || 0}
          description="Unique visitors today"
          icon={<Users className="h-4 w-4 text-purple-600" />}
          status="good"
          trend="up"
          isDemo={isDemo}
        />
      </div>

      {/* Real-time Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RealTimeActivityCard
          realTimeVisitors={realTimeVisitors}
          pageViews={analyticsData?.pageViews || 0}
          sessions={analyticsData?.sessions || 0}
        />

        <CoreWebVitalsCard performanceMetrics={performanceMetrics} />

        <SystemStatusCard systemHealth={systemHealth} />
      </div>

      {/* Status Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-4">
              <span>Auto-refresh: Every 30s</span>
              <Badge variant="outline" className={isDemo ? 'border-orange-200 text-orange-700' : 'border-green-200 text-green-700'}>
                <BarChart3 className="h-3 w-3 mr-1" />
                {isDemo ? 'Demo Mode' : 'Live Data'}
                {gaInitializing && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Details Modal */}
      <ErrorDetailsModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errors={errors}
        onResolveError={resolveError}
        onAcknowledgeError={acknowledgeError}
      />
    </div>
  );
};

export default SiteMetricsDashboard;
