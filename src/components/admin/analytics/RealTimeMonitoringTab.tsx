import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Activity, Zap, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import RealTimeActivityCard from '../metrics/RealTimeActivityCard';

const RealTimeMonitoringTab = () => {
  const { 
    realTimeVisitors, 
    analyticsData, 
    systemHealth,
    loading, 
    refreshData 
  } = useRealAnalytics();
  
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      refreshData();
      setLastUpdate(new Date());
    };

    window.addEventListener('resetRealTimeMonitoring', handleReset);
    return () => window.removeEventListener('resetRealTimeMonitoring', handleReset);
  }, [refreshData]);

  const handleRefresh = () => {
    refreshData();
    setLastUpdate(new Date());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getHealthStatus = (uptime: number) => {
    if (uptime >= 99.5) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (uptime >= 98) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (uptime >= 95) return { status: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const healthStatus = getHealthStatus(systemHealth?.uptime || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Real-time Monitoring</h2>
          <p className="text-muted-foreground">
            Live website activity, system status, and performance alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeVisitors}</div>
            <p className="text-xs text-muted-foreground">
              Currently browsing
            </p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-green-600">Live</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(systemHealth?.uptime || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Uptime
            </p>
            <Badge variant="secondary" className={`mt-2 ${healthStatus.bgColor} ${healthStatus.color}`}>
              {healthStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.responseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Average response
            </p>
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                (systemHealth?.responseTime || 0) < 200 ? 'bg-green-500' : 
                (systemHealth?.responseTime || 0) < 500 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs ${
                (systemHealth?.responseTime || 0) < 200 ? 'text-green-600' : 
                (systemHealth?.responseTime || 0) < 500 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(systemHealth?.responseTime || 0) < 200 ? 'Fast' : 
                 (systemHealth?.responseTime || 0) < 500 ? 'Moderate' : 'Slow'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Dashboard</CardTitle>
          <CardDescription>Real-time visitor activity and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <RealTimeActivityCard 
            realTimeVisitors={realTimeVisitors}
            pageViews={analyticsData?.pageViews || 0}
            sessions={analyticsData?.sessions || 0}
          />
        </CardContent>
      </Card>

      {/* System Health Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Health Alerts
          </CardTitle>
          <CardDescription>Current system status and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Database Health */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth?.databaseHealth === 'healthy' ? 'bg-green-500' : 
                  systemHealth?.databaseHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">Database</span>
              </div>
              <Badge variant={
                systemHealth?.databaseHealth === 'healthy' ? 'default' : 
                systemHealth?.databaseHealth === 'degraded' ? 'secondary' : 'destructive'
              }>
                {systemHealth?.databaseHealth || 'Unknown'}
              </Badge>
            </div>

            {/* Storage Health */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth?.storageHealth === 'healthy' ? 'bg-green-500' : 
                  systemHealth?.storageHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">Storage</span>
              </div>
              <Badge variant={
                systemHealth?.storageHealth === 'healthy' ? 'default' : 
                systemHealth?.storageHealth === 'degraded' ? 'secondary' : 'destructive'
              }>
                {systemHealth?.storageHealth || 'Unknown'}
              </Badge>
            </div>

            {/* Error Rate */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  (systemHealth?.errorRate || 0) < 1 ? 'bg-green-500' : 
                  (systemHealth?.errorRate || 0) < 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">Error Rate</span>
              </div>
              <Badge variant={
                (systemHealth?.errorRate || 0) < 1 ? 'default' : 
                (systemHealth?.errorRate || 0) < 5 ? 'secondary' : 'destructive'
              }>
                {(systemHealth?.errorRate || 0).toFixed(2)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMonitoringTab;