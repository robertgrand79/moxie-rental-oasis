import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Server, 
  Shield, 
  HardDrive,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface ServiceCheck {
  status: string;
  latency?: number;
}

interface HealthChecks {
  database?: ServiceCheck;
  storage?: ServiceCheck;
  auth?: ServiceCheck;
  api?: ServiceCheck;
}

interface HealthCheck {
  id: string;
  status: string;
  checks: HealthChecks | null;
  uptime: number | null;
  created_at: string;
}

const HealthStatusPanel: React.FC = () => {
  const { data: healthChecks, isLoading, refetch } = useQuery({
    queryKey: ['health-checks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_check_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(24);
      
      if (error) throw error;
      return data as HealthCheck[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const latestCheck = healthChecks?.[0];
  const checks: HealthChecks = latestCheck?.checks || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'unhealthy':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getOverallStatus = () => {
    if (!latestCheck) return 'unknown';
    return latestCheck.status;
  };

  const calculateUptime = () => {
    if (!healthChecks || healthChecks.length === 0) return 100;
    const healthyCount = healthChecks.filter(h => h.status === 'healthy').length;
    return Math.round((healthyCount / healthChecks.length) * 100);
  };

  const services = [
    { key: 'database', label: 'Database', icon: Database, check: checks.database },
    { key: 'storage', label: 'Storage', icon: HardDrive, check: checks.storage },
    { key: 'auth', label: 'Authentication', icon: Shield, check: checks.auth },
    { key: 'api', label: 'API Services', icon: Server, check: checks.api },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time service status and uptime monitoring
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(getOverallStatus())}>
              {getStatusIcon(getOverallStatus())}
              <span className="ml-1 capitalize">{getOverallStatus()}</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Uptime Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>24-Hour Uptime</span>
            <span className="font-medium">{calculateUptime()}%</span>
          </div>
          <Progress value={calculateUptime()} className="h-2" />
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => {
            const status = service.check?.status || 'unknown';
            const latency = service.check?.latency;
            
            return (
              <div
                key={service.key}
                className={`p-4 rounded-lg border ${getStatusColor(status)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <service.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{service.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  {getStatusIcon(status)}
                  {latency && (
                    <span className="text-xs opacity-75">{latency}ms</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Health History */}
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading health data...</div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Status History</h4>
            <div className="flex gap-1">
              {healthChecks?.slice(0, 24).reverse().map((check, i) => (
                <div
                  key={check.id}
                  className={`flex-1 h-8 rounded-sm ${
                    check.status === 'healthy' 
                      ? 'bg-green-500' 
                      : check.status === 'degraded'
                      ? 'bg-yellow-500'
                      : 'bg-destructive'
                  }`}
                  title={`${format(new Date(check.created_at), 'MMM d, HH:mm')} - ${check.status}`}
                />
              ))}
              {(!healthChecks || healthChecks.length === 0) && (
                <div className="text-sm text-muted-foreground">No health data available</div>
              )}
            </div>
            {latestCheck && (
              <p className="text-xs text-muted-foreground">
                Last check: {format(new Date(latestCheck.created_at), 'MMM d, yyyy HH:mm:ss')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthStatusPanel;
