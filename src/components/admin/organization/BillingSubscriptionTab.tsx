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
  Sparkles,
  AlertCircle,
  RefreshCw
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
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);

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

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return <Badge variant="outline">No Subscription</Badge>;
    }
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      canceled: 'outline',
      free: 'outline',
    };
    const labels: Record<string, string> = {
      active: 'Active',
      trialing: 'Trial',
      past_due: 'Past Due',
      canceled: 'Canceled',
      free: 'Free',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
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

  const handleSubscribe = async (templateSlug: string) => {
    if (!organization) return;
    
    setSubscribingTo(templateSlug);
    try {
      const { data, error } = await supabase.functions.invoke('platform-subscription-checkout', {
        body: {
          organizationId: organization.id,
          templateSlug,
          successUrl: `${window.location.origin}/admin/settings/organization?subscription=success`,
          cancelUrl: `${window.location.origin}/admin/settings/organization?subscription=cancelled`,
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
        description: error instanceof Error ? error.message : 'Failed to start subscription',
        variant: 'destructive',
      });
    } finally {
      setSubscribingTo(null);
    }
  };

  if (!organization) return null;

  // Determine subscription status
  const hasActiveSubscription = ['active', 'trialing'].includes(organization.subscription_status || '');
  const needsSubscription = !hasActiveSubscription;
  const isCanceled = organization.subscription_status === 'canceled';
  const isPastDue = organization.subscription_status === 'past_due';
  const hasStripeCustomer = !!(organization as any).stripe_customer_id;

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {organization.template_type === 'single_property' ? (
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
                {hasActiveSubscription 
                  ? (currentTemplate?.name || organization.subscription_tier || 'Active Plan')
                  : 'No Active Plan'
                }
              </h3>
              <p className="text-sm text-muted-foreground">
                {hasActiveSubscription 
                  ? (currentTemplate?.description || 'Your current subscription')
                  : 'Choose a plan below to get started'
                }
              </p>
            </div>
            <div className="text-right">
              {hasActiveSubscription && currentTemplate && (
                <p className="text-2xl font-bold">
                  {formatPrice(currentTemplate.monthly_price_cents)}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              )}
              <div className="mt-1">
                {getStatusBadge(organization.subscription_status)}
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

          {/* Past Due Warning */}
          {isPastDue && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Payment Past Due</p>
                <p className="text-sm text-muted-foreground">
                  Please update your payment method to continue your subscription.
                </p>
              </div>
              {hasStripeCustomer && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleOpenCustomerPortal}
                  disabled={isCreatingPortal}
                >
                  {isCreatingPortal ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Update Payment'
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Canceled Notice */}
          {isCanceled && (
            <div className="flex items-center gap-3 p-4 bg-muted border rounded-lg">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Subscription Canceled</p>
                <p className="text-sm text-muted-foreground">
                  Reactivate your subscription to regain access to all features.
                </p>
              </div>
            </div>
          )}

          {/* Features for active subscriptions */}
          {hasActiveSubscription && currentTemplate?.features && (
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

      {/* Billing Actions for Active Subscribers */}
      {hasActiveSubscription && hasStripeCustomer && (
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

      {/* Choose Your Plan - Show for all orgs without active subscription */}
      {needsSubscription && templates && templates.length > 0 && (
        <>
          <Separator />
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {isCanceled ? 'Reactivate Your Subscription' : 'Choose Your Plan'}
              </CardTitle>
              <CardDescription>
                {isCanceled 
                  ? 'Select a plan to reactivate your subscription and continue using all features'
                  : 'Select the plan that best fits your needs'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {templates.map((template) => {
                  const isCurrentType = template.slug === organization.template_type;
                  const isSubscribing = subscribingTo === template.slug;
                  
                  return (
                    <div
                      key={template.id}
                      className={`relative p-6 rounded-lg border-2 transition-all ${
                        isCurrentType 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {isCurrentType && (
                        <Badge className="absolute -top-2 left-4 bg-primary">
                          Recommended
                        </Badge>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {template.slug === 'single_property' ? (
                            <Home className="h-5 w-5 text-primary" />
                          ) : (
                            <Building2 className="h-5 w-5 text-primary" />
                          )}
                          <h3 className="font-semibold text-lg">{template.name}</h3>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      
                      <div className="mb-4">
                        <span className="text-3xl font-bold">
                          {formatPrice(template.monthly_price_cents)}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      
                      <ul className="space-y-2 mb-6">
                        {template.features.slice(0, 5).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                        {template.features.length > 5 && (
                          <li className="text-sm text-muted-foreground pl-6">
                            + {template.features.length - 5} more features
                          </li>
                        )}
                      </ul>
                      
                      <Button 
                        className="w-full"
                        variant={isCurrentType ? 'default' : 'outline'}
                        onClick={() => handleSubscribe(template.slug)}
                        disabled={isSubscribing || subscribingTo !== null}
                      >
                        {isSubscribing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Subscribe Now
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Upgrade Option for Single Property with Active Subscription */}
      {hasActiveSubscription && organization.template_type === 'single_property' && templates && (
        <>
          {(() => {
            const upgradeTemplate = templates.find(t => t.slug === 'multi_property');
            if (!upgradeTemplate) return null;
            
            return (
              <>
                <Separator />
                <Card className="border-primary/30">
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

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {upgradeTemplate.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      onClick={() => handleSubscribe('multi_property')}
                      disabled={subscribingTo !== null}
                      className="w-full sm:w-auto"
                    >
                      {subscribingTo === 'multi_property' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                      )}
                      Upgrade to Multi-Property
                    </Button>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </>
      )}

      {/* Support Notice */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Need help with your subscription?{' '}
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
