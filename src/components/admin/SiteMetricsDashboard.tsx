
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Globe, 
  Users, 
  Zap,
  RefreshCw
} from 'lucide-react';
import ErrorDetailsModal from '@/components/admin/ErrorDetailsModal';
import { useErrorTracking } from '@/hooks/useErrorTracking';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  clickable?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  status = 'good', 
  trend, 
  onClick, 
  clickable = false 
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
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
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
  const [metrics, setMetrics] = useState({
    uptime: '99.9%',
    loadTime: '1.2s',
    visitors: 1247,
    lastCheck: new Date().toLocaleTimeString()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const { 
    errors, 
    resolveError, 
    acknowledgeError, 
    getActiveErrorCount, 
    getCriticalErrorCount 
  } = useErrorTracking();

  // Simulate real-time metrics (in production, this would fetch from your monitoring service)
  const refreshMetrics = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMetrics({
      uptime: Math.random() > 0.1 ? '99.9%' : '98.5%',
      loadTime: `${(Math.random() * 2 + 0.8).toFixed(1)}s`,
      visitors: Math.floor(Math.random() * 500 + 1000),
      lastCheck: new Date().toLocaleTimeString()
    });
    
    setIsRefreshing(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLoadTimeStatus = (loadTime: string) => {
    const time = parseFloat(loadTime);
    if (time < 1.5) return 'good';
    if (time < 3) return 'warning';
    return 'error';
  };

  const getErrorStatus = (errorCount: number) => {
    if (errorCount === 0) return 'good';
    if (errorCount < 5) return 'warning';
    return 'error';
  };

  const activeErrorCount = getActiveErrorCount();
  const criticalErrorCount = getCriticalErrorCount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Performance Metrics</h2>
          <p className="text-gray-600">Real-time monitoring of your website's health and performance</p>
        </div>
        <Button 
          onClick={refreshMetrics} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Site Uptime"
          value={metrics.uptime}
          description="Last 30 days availability"
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
          status={parseFloat(metrics.uptime) > 99 ? 'good' : 'warning'}
          trend="up"
        />
        
        <MetricCard
          title="Page Load Speed"
          value={metrics.loadTime}
          description="Average load time"
          icon={<Zap className="h-4 w-4 text-blue-600" />}
          status={getLoadTimeStatus(metrics.loadTime)}
        />
        
        <MetricCard
          title="Active Errors"
          value={activeErrorCount}
          description={`${criticalErrorCount} critical errors detected`}
          icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
          status={getErrorStatus(activeErrorCount)}
          onClick={() => setIsErrorModalOpen(true)}
          clickable={true}
        />
        
        <MetricCard
          title="Daily Visitors"
          value={metrics.visitors}
          description="Unique visitors today"
          icon={<Users className="h-4 w-4 text-purple-600" />}
          status="good"
          trend="up"
        />
      </div>

      {/* Detailed Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Web Vitals Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Core Web Vitals
            </CardTitle>
            <CardDescription>
              Google's performance metrics for user experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Largest Contentful Paint (LCP)</p>
                <p className="text-sm text-gray-600">Time to render largest element</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                1.2s
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">First Input Delay (FID)</p>
                <p className="text-sm text-gray-600">Time to first user interaction</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                89ms
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Cumulative Layout Shift (CLS)</p>
                <p className="text-sm text-gray-600">Visual stability score</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                0.05
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
              Current status of site components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Website</p>
                <p className="text-sm text-gray-600">Main site functionality</p>
              </div>
              <Badge className="bg-green-600">
                Operational
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-gray-600">Supabase connection</p>
              </div>
              <Badge className="bg-green-600">
                Operational
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">AI Chat</p>
                <p className="text-sm text-gray-600">Customer support system</p>
              </div>
              <Badge className="bg-green-600">
                Operational
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Email Service</p>
                <p className="text-sm text-gray-600">Newsletter & notifications</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Degraded
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
              Last updated: {metrics.lastCheck}
            </div>
            <div className="flex items-center gap-4">
              <span>Auto-refresh: Every 30s</span>
              <Badge variant="outline">Live</Badge>
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
