import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Home, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  churnedOrganizations: number;
  totalUsers: number;
  totalProperties: number;
  totalReservations: number;
  recentReservations: number;
  totalErrors: number;
  unresolvedErrors: number;
  avgResponseTime: number;
}

const PlatformMetricsCards: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      // Fetch organization stats
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, is_active, subscription_status');

      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch property count
      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Fetch reservation stats
      const { count: totalReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Fetch error stats
      const { count: totalErrors } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true });

      const { count: unresolvedErrors } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

      const activeOrgs = orgs?.filter(o => o.is_active).length || 0;
      const trialOrgs = orgs?.filter(o => o.subscription_status === 'trial').length || 0;
      const churnedOrgs = orgs?.filter(o => o.subscription_status === 'churned' || !o.is_active).length || 0;

      return {
        totalOrganizations: orgs?.length || 0,
        activeOrganizations: activeOrgs,
        trialOrganizations: trialOrgs,
        churnedOrganizations: churnedOrgs,
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        totalReservations: totalReservations || 0,
        recentReservations: recentReservations || 0,
        totalErrors: totalErrors || 0,
        unresolvedErrors: unresolvedErrors || 0,
        avgResponseTime: 0, // Would need actual API monitoring
      } as PlatformMetrics;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description,
    trend,
    trendUp
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ElementType;
    description?: string;
    trend?: string;
    trendUp?: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? '...' : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-2 ${trendUp ? 'text-green-600' : 'text-destructive'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Organizations"
            value={metrics?.totalOrganizations || 0}
            icon={Building2}
            description="All registered organizations"
          />
          <MetricCard
            title="Active Organizations"
            value={metrics?.activeOrganizations || 0}
            icon={CheckCircle}
            description="Currently active"
          />
          <MetricCard
            title="Trial Organizations"
            value={metrics?.trialOrganizations || 0}
            icon={Clock}
            description="On trial period"
          />
          <MetricCard
            title="Churned"
            value={metrics?.churnedOrganizations || 0}
            icon={XCircle}
            description="Inactive or cancelled"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Usage Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            icon={Users}
          />
          <MetricCard
            title="Total Properties"
            value={metrics?.totalProperties || 0}
            icon={Home}
          />
          <MetricCard
            title="Total Reservations"
            value={metrics?.totalReservations || 0}
            icon={Calendar}
          />
          <MetricCard
            title="Last 30 Days"
            value={metrics?.recentReservations || 0}
            icon={TrendingUp}
            description="New reservations"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Errors"
            value={metrics?.totalErrors || 0}
            icon={Activity}
            description="All recorded errors"
          />
          <MetricCard
            title="Unresolved Errors"
            value={metrics?.unresolvedErrors || 0}
            icon={Activity}
            description={
              metrics?.unresolvedErrors === 0 
                ? 'All errors resolved!' 
                : 'Needs attention'
            }
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Error Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : metrics?.totalErrors 
                  ? `${Math.round(((metrics.totalErrors - metrics.unresolvedErrors) / metrics.totalErrors) * 100)}%`
                  : '100%'
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(metrics?.totalErrors || 0) - (metrics?.unresolvedErrors || 0)} of {metrics?.totalErrors || 0} resolved
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformMetricsCards;
