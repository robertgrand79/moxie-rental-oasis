
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Globe, 
  Users, 
  Zap,
  RefreshCw,
  Info,
  BarChart3,
  Eye
} from 'lucide-react';
import ErrorDetailsModal from '@/components/admin/ErrorDetailsModal';
import { useErrorTracking } from '@/hooks/useErrorTracking';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  clickable?: boolean;
  isDemo?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  status = 'good', 
  trend, 
  onClick, 
  clickable = false,
  isDemo = false
}: MetricCardProps) => {
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <Card 
      className={`border-l-4 ${statusColors[status]} ${
        clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          {isDemo && <Badge variant="secondary" className="text-xs">Demo</Badge>}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2">
          {value}
          {trend && (
            <TrendingUp className={`h-4 w-4 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500 rotate-180' : 
              'text-gray-500'
            }`} />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
          {clickable && (
            <span className="ml-2 text-blue-600 font-medium">Click to view details</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

const SiteMetricsDashboard = () => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { 
    analyticsData, 
    performanceMetrics, 
    systemHealth, 
    realTimeVisitors,
    loading, 
    isDemo, 
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

  const getHealthStatus = (health: string) => {
    switch (health) {
      case 'healthy': return 'good';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      default: return 'warning';
    }
  };

  const activeErrorCount = getActiveErrorCount();
  const criticalErrorCount = getCriticalErrorCount();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Site Performance Metrics</h2>
            <p className="text-gray-600">Loading real-time monitoring data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Performance Metrics</h2>
          <p className="text-gray-600">
            {isDemo ? 'Demo analytics data' : 'Real-time monitoring'} of your website's health and performance
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isDemo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            These are demo metrics. To see real analytics data, configure Google Analytics in your site settings.
            <Button variant="link" className="p-0 h-auto ml-2" asChild>
              <a href="/admin/settings">Configure Analytics</a>
            </Button>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Real-time Activity
            </CardTitle>
            <CardDescription>
              Current visitors and live activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Active Visitors</p>
                <p className="text-sm text-gray-600">Currently browsing</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                {realTimeVisitors}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Page Views</p>
                <p className="text-sm text-gray-600">Today's total</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {analyticsData?.pageViews || 0}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium">Sessions</p>
                <p className="text-sm text-gray-600">Active sessions</p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {analyticsData?.sessions || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Core Web Vitals Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Core Web Vitals
            </CardTitle>
            <CardDescription>
              Real performance metrics from user browsers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Largest Contentful Paint</p>
                <p className="text-sm text-gray-600">Time to render largest element</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {((performanceMetrics?.largestContentfulPaint || 1200) / 1000).toFixed(1)}s
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">First Input Delay</p>
                <p className="text-sm text-gray-600">Time to first user interaction</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {performanceMetrics?.firstInputDelay || 89}ms
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Cumulative Layout Shift</p>
                <p className="text-sm text-gray-600">Visual stability score</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {performanceMetrics?.cumulativeLayoutShift || 0.05}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Real-time health of site components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex justify-between items-center p-3 rounded-lg ${
              getHealthStatus(systemHealth?.databaseHealth || 'healthy') === 'good' ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-gray-600">Supabase connection</p>
              </div>
              <Badge className={
                getHealthStatus(systemHealth?.databaseHealth || 'healthy') === 'good' ? 'bg-green-600' : 'bg-yellow-600'
              }>
                {systemHealth?.databaseHealth || 'Checking...'}
              </Badge>
            </div>
            
            <div className={`flex justify-between items-center p-3 rounded-lg ${
              getHealthStatus(systemHealth?.storageHealth || 'healthy') === 'good' ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <div>
                <p className="font-medium">File Storage</p>
                <p className="text-sm text-gray-600">Image & document storage</p>
              </div>
              <Badge className={
                getHealthStatus(systemHealth?.storageHealth || 'healthy') === 'good' ? 'bg-green-600' : 'bg-yellow-600'
              }>
                {systemHealth?.storageHealth || 'Checking...'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Response Time</p>
                <p className="text-sm text-gray-600">Average API response</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {systemHealth?.responseTime || 0}ms
              </Badge>
            </div>
          </CardContent>
        </Card>
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
              <Badge variant="outline">
                <BarChart3 className="h-3 w-3 mr-1" />
                {isDemo ? 'Demo Mode' : 'Live Data'}
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
