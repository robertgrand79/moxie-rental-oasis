import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Users, AlertTriangle, Zap } from 'lucide-react';
import { usePlatformAIUsage } from '@/hooks/usePlatformAIUsage';

const AIMetricsOverview = () => {
  const { platformMetrics, loadingTenantUsage } = usePlatformAIUsage();

  const metrics = [
    {
      label: 'Requests Today',
      value: platformMetrics?.totalRequests24h || 0,
      icon: Zap,
      color: 'text-blue-500',
    },
    {
      label: 'Requests (30 days)',
      value: platformMetrics?.totalRequests30d || 0,
      icon: Brain,
      color: 'text-purple-500',
    },
    {
      label: 'Active Tenants',
      value: platformMetrics?.activeTenants || 0,
      icon: Users,
      color: 'text-green-500',
    },
    {
      label: 'At/Near Limit',
      value: (platformMetrics?.tenantsAtLimit || 0) + (platformMetrics?.tenantsApproachingLimit || 0),
      icon: AlertTriangle,
      color: platformMetrics?.tenantsAtLimit ? 'text-destructive' : 'text-yellow-500',
      subtext: platformMetrics?.tenantsAtLimit 
        ? `${platformMetrics.tenantsAtLimit} at limit, ${platformMetrics.tenantsApproachingLimit} approaching`
        : undefined,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="pt-6">
            {loadingTenantUsage ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                  {metric.subtext && (
                    <p className="text-xs text-muted-foreground mt-1">{metric.subtext}</p>
                  )}
                </div>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIMetricsOverview;
