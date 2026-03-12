import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Home, 
  Calendar, 
  TrendingUp, 
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
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, is_active, subscription_status');

      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      const { count: totalReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

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
        avgResponseTime: 0,
      } as PlatformMetrics;
    },
    refetchInterval: 60000,
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
    <Card className="border-border/30 bg-gradient-to-br from-background to-muted/20 transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-semibold tracking-tight text-foreground">
          {isLoading ? '...' : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
        )}
        {trend && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium mt-2 ${
            trendUp ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'
          }`}>
            <TrendingUp className={`h-3 w-3 ${!trendUp && 'rotate-180'}`} strokeWidth={1.5} />
            {trend}
          </span>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">Platform Overview</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Organizations" value={metrics?.totalOrganizations || 0} icon={Building2} description="All registered organizations" />
          <MetricCard title="Active Organizations" value={metrics?.activeOrganizations || 0} icon={CheckCircle} description="Currently active" />
          <MetricCard title="Trial Organizations" value={metrics?.trialOrganizations || 0} icon={Clock} description="On trial period" />
          <MetricCard title="Churned" value={metrics?.churnedOrganizations || 0} icon={XCircle} description="Inactive or cancelled" />
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">Usage Metrics</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Users" value={metrics?.totalUsers || 0} icon={Users} />
          <MetricCard title="Total Properties" value={metrics?.totalProperties || 0} icon={Home} />
          <MetricCard title="Total Reservations" value={metrics?.totalReservations || 0} icon={Calendar} />
          <MetricCard title="Last 30 Days" value={metrics?.recentReservations || 0} icon={TrendingUp} description="New reservations" />
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">System Health</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard title="Total Errors" value={metrics?.totalErrors || 0} icon={Activity} description="All recorded errors" />
          <MetricCard
            title="Unresolved Errors"
            value={metrics?.unresolvedErrors || 0}
            icon={Activity}
            description={metrics?.unresolvedErrors === 0 ? 'All errors resolved!' : 'Needs attention'}
          />
          <Card className="border-border/30 bg-gradient-to-br from-background to-muted/20 transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Error Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                {isLoading ? '...' : metrics?.totalErrors 
                  ? `${Math.round(((metrics.totalErrors - metrics.unresolvedErrors) / metrics.totalErrors) * 100)}%`
                  : '100%'
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
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
