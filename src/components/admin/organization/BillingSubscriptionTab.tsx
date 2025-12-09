import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  Home,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface SiteTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price_cents: number;
  features: string[];
  max_properties: number | null;
}

const BillingSubscriptionTab = () => {
  const { organization, refetch } = useCurrentOrganization();
  const { toast } = useToast();
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Fetch available templates
  const { data: templates } = useQuery({
    queryKey: ['site-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as SiteTemplate[];
    },
  });

  const currentTemplate = templates?.find(t => t.slug === organization?.template_type);
  const upgradeTemplate = templates?.find(t => t.slug === 'multi_property');

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      canceled: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'trialing' ? 'Trial' : status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const handleOpenCustomerPortal = async () => {
    if (!organization) return;
    
    setIsCreatingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {
        body: {
          organizationId: organization.id,
          returnUrl: window.location.href,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open billing portal',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingPortal(false);
    }
  };

  const handleUpgrade = async (templateSlug: string) => {
    if (!organization) return;
    
    setIsUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('platform-subscription-checkout', {
        body: {
          organizationId: organization.id,
          templateSlug,
          successUrl: `${window.location.origin}/admin/organization?subscription=success`,
          cancelUrl: `${window.location.origin}/admin/organization?subscription=cancelled`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start upgrade',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!organization) return null;

  const isOnSingleProperty = organization.template_type === 'single_property';
  const hasActiveSubscription = ['active', 'trialing'].includes(organization.subscription_status || '');

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnSingleProperty ? (
              <Home className="h-5 w-5" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
            Current Plan
          </CardTitle>
          <CardDescription>Your subscription details and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">
                {currentTemplate?.name || organization.subscription_tier || 'Free'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentTemplate?.description || 'No active subscription'}
              </p>
            </div>
            <div className="text-right">
              {currentTemplate && (
                <p className="text-2xl font-bold">
                  {formatPrice(currentTemplate.monthly_price_cents)}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              )}
              <div className="mt-1">
                {getStatusBadge(organization.subscription_status || 'free')}
              </div>
            </div>
          </div>

          {/* Trial info */}
          {organization.subscription_status === 'trialing' && organization.trial_ends_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Trial ends:</span>
              <span className="font-medium">
                {format(new Date(organization.trial_ends_at), 'MMMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Features */}
          {currentTemplate?.features && (
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Included features:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentTemplate.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Actions */}
      {hasActiveSubscription && (organization as any).stripe_customer_id && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Management</CardTitle>
            <CardDescription>Manage your payment method and view invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={handleOpenCustomerPortal}
                disabled={isCreatingPortal}
              >
                {isCreatingPortal ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Payment Method
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenCustomerPortal}
                disabled={isCreatingPortal}
              >
                {isCreatingPortal ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                View Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Option */}
      {isOnSingleProperty && upgradeTemplate && (
        <>
          <Separator />
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-primary" />
                Upgrade Your Plan
              </CardTitle>
              <CardDescription>
                Unlock more features with a Multi-Property subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{upgradeTemplate.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {upgradeTemplate.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(upgradeTemplate.monthly_price_cents)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                </div>
              </div>

              {/* Upgrade features */}
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {upgradeTemplate.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleUpgrade('multi_property')}
                disabled={isUpgrading}
                className="w-full sm:w-auto"
              >
                {isUpgrading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                )}
                Upgrade to Multi-Property
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Downgrade / Cancel Notice */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Need to downgrade or cancel your subscription?{' '}
            <a href="mailto:support@staymoxie.com" className="text-primary hover:underline">
              Contact support@staymoxie.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSubscriptionTab;
