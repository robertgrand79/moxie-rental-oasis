import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  Users, 
  Clock, 
  AlertCircle, 
  Gift, 
  XCircle 
} from 'lucide-react';

interface SubscriptionMetrics {
  active_subscriptions: number;
  trial_subscriptions: number;
  canceled_subscriptions: number;
  past_due_subscriptions: number;
  comped_subscriptions: number;
  trials_ending_soon: number;
  monthly_recurring_revenue_cents: number;
}

interface BillingMetricsCardProps {
  metrics: SubscriptionMetrics | undefined;
  isLoading: boolean;
}

const BillingMetricsCard = ({ metrics, isLoading }: BillingMetricsCardProps) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(Math.floor(cents / 100));
  };

  const metricItems = [
    {
      label: 'MRR',
      value: metrics ? formatCurrency(metrics.monthly_recurring_revenue_cents) : '$0',
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Active',
      value: metrics?.active_subscriptions ?? 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Trialing',
      value: metrics?.trial_subscriptions ?? 0,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      subtext: metrics?.trials_ending_soon ? `${metrics.trials_ending_soon} ending soon` : undefined,
    },
    {
      label: 'Past Due',
      value: metrics?.past_due_subscriptions ?? 0,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Comped',
      value: metrics?.comped_subscriptions ?? 0,
      icon: Gift,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      label: 'Canceled',
      value: metrics?.canceled_subscriptions ?? 0,
      icon: XCircle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricItems.map((item) => (
        <Card key={item.label} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold mt-1">{item.value}</p>
                )}
                {item.subtext && (
                  <p className="text-xs text-amber-600 mt-1">{item.subtext}</p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BillingMetricsCard;
