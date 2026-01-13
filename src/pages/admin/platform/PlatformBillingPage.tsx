import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import BillingMetricsCard from '@/components/admin/platform/billing/BillingMetricsCard';
import FailedPaymentsQueue from '@/components/admin/platform/billing/FailedPaymentsQueue';
import RevenueCharts from '@/components/admin/platform/billing/RevenueCharts';
import SubscriptionsList from '@/components/admin/platform/billing/SubscriptionsList';
import { usePlatformBilling } from '@/hooks/usePlatformBilling';

const PlatformBillingPage = () => {
  const { 
    metrics, 
    loadingMetrics, 
    failedPayments, 
    loadingFailedPayments 
  } = usePlatformBilling();

  const pendingPaymentsCount = failedPayments?.length || 0;

  return (
    <>
      <Helmet>
        <title>Billing & Subscriptions | Platform Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Billing & Subscriptions</h1>
            <p className="text-muted-foreground">
              Monitor subscription health, revenue, and manage failed payments
            </p>
          </div>
        </div>

        {/* Metrics Overview */}
        <BillingMetricsCard metrics={metrics} isLoading={loadingMetrics} />

        {/* Tabbed Content */}
        <Tabs defaultValue="failed-payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="failed-payments" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Failed Payments
              {pendingPaymentsCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                  {pendingPaymentsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Subscriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="failed-payments">
            <FailedPaymentsQueue />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueCharts />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsList />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PlatformBillingPage;
