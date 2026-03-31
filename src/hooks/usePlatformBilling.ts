import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionMetrics {
  active_subscriptions: number;
  trial_subscriptions: number;
  canceled_subscriptions: number;
  past_due_subscriptions: number;
  comped_subscriptions: number;
  trials_ending_soon: number;
  monthly_recurring_revenue_cents: number;
}

interface FailedPayment {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  stripe_customer_id: string | null;
  amount_cents: number;
  currency: string;
  failure_reason: string | null;
  failure_code: string | null;
  attempt_count: number;
  last_attempt_at: string;
  next_retry_at: string | null;
  status: 'pending' | 'retrying' | 'resolved' | 'written_off';
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  invoice_metadata: Record<string, any> | null;
  email_alert_sent_at: string | null;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
    subscription_tier: string | null;
  };
}

interface OrganizationSubscription {
  id: string;
  name: string;
  subscription_status: string | null;
  subscription_tier: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  discount_percent: number | null;
  discount_notes: string | null;
}

interface RevenueDataPoint {
  month: string;
  mrr: number;
  newSubscriptions: number;
  churned: number;
}

export const usePlatformBilling = () => {
  const queryClient = useQueryClient();

  // Fetch subscription metrics
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['platform-subscription-metrics'],
    queryFn: async (): Promise<SubscriptionMetrics> => {
      const { data, error } = await supabase
        .from('platform_subscription_metrics')
        .select('*')
        .single();

      if (error) throw error;
      return data as SubscriptionMetrics;
    },
  });

  // Fetch failed payments
  const { data: failedPayments, isLoading: loadingFailedPayments } = useQuery({
    queryKey: ['platform-failed-payments'],
    queryFn: async (): Promise<FailedPayment[]> => {
      const { data, error } = await supabase
        .from('platform_failed_payments')
        .select(`
          *,
          organization:organizations(id, name, subscription_tier)
        `)
        .in('status', ['pending', 'retrying'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as FailedPayment[];
    },
  });

  // Fetch all subscriptions for list view
  const { data: subscriptions, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ['platform-all-subscriptions'],
    queryFn: async (): Promise<OrganizationSubscription[]> => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, subscription_status, subscription_tier, trial_ends_at, stripe_customer_id, created_at, discount_percent, discount_notes')
        .eq('is_template', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate revenue history (last 6 months based on current data)
  const { data: revenueHistory, isLoading: loadingRevenue } = useQuery({
    queryKey: ['platform-revenue-history'],
    queryFn: async (): Promise<RevenueDataPoint[]> => {
      // Get organizations created in last 6 months with their subscription info
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('created_at, subscription_status, subscription_tier, discount_percent')
        .eq('is_template', false)
        .gte('created_at', sixMonthsAgo.toISOString());

      if (error) throw error;

      // Get template prices
      const { data: templates } = await supabase
        .from('site_templates')
        .select('slug, monthly_price_cents');

      const priceMap = new Map(templates?.map(t => [t.slug, t.monthly_price_cents || 0]) || []);

      // Group by month and calculate metrics
      const monthlyData = new Map<string, { mrr: number; new: number; churned: number }>();
      
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toISOString().slice(0, 7);
        monthlyData.set(key, { mrr: 0, new: 0, churned: 0 });
      }

      orgs?.forEach(org => {
        const monthKey = org.created_at.slice(0, 7);
        if (monthlyData.has(monthKey)) {
          const data = monthlyData.get(monthKey)!;
          data.new += 1;
          if (org.subscription_status === 'active' && org.subscription_tier) {
            let price = priceMap.get(org.subscription_tier) || 0;
            if (org.discount_percent && org.discount_percent > 0) {
              price = price * (100 - org.discount_percent) / 100;
            }
            data.mrr += price;
          }
        }
      });

      return Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        mrr: Math.floor(data.mrr / 100),
        newSubscriptions: data.new,
        churned: data.churned,
      }));
    },
  });

  // Mark failed payment as resolved
  const resolvePaymentMutation = useMutation({
    mutationFn: async ({ 
      paymentId, 
      status, 
      notes 
    }: { 
      paymentId: string; 
      status: 'resolved' | 'written_off'; 
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('platform_failed_payments')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          resolution_notes: notes,
        })
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-failed-payments'] });
      toast.success('Payment status updated');
    },
    onError: (error) => {
      toast.error('Failed to update payment: ' + error.message);
    },
  });

  // Retry payment via Stripe
  const retryPaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await supabase.functions.invoke('retry-subscription-payment', {
        body: { paymentId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-failed-payments'] });
      toast.success('Payment retry initiated');
    },
    onError: (error) => {
      toast.error('Failed to retry payment: ' + error.message);
    },
  });

  return {
    metrics,
    loadingMetrics,
    failedPayments,
    loadingFailedPayments,
    subscriptions,
    loadingSubscriptions,
    revenueHistory,
    loadingRevenue,
    resolvePayment: resolvePaymentMutation.mutate,
    retryPayment: retryPaymentMutation.mutate,
    isResolving: resolvePaymentMutation.isPending,
    isRetrying: retryPaymentMutation.isPending,
  };
};
