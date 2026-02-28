import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, CheckCircle2, AlertCircle, Shield, Loader2, ExternalLink, Zap } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { PriceLabsSettings } from '@/components/admin/settings/PriceLabsSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ConfigStatus = ({ configured }: { configured: boolean }) => (
  <span className={`flex items-center gap-1 text-sm ${configured ? 'text-green-600' : 'text-muted-foreground'}`}>
    {configured ? (
      <>
        <CheckCircle2 className="h-4 w-4" />
        Configured
      </>
    ) : (
      <>
        <AlertCircle className="h-4 w-4" />
        Not configured
      </>
    )}
  </span>
);

const ConnectStatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    active: { variant: 'default', label: 'Active' },
    pending: { variant: 'secondary', label: 'Pending Onboarding' },
    pending_verification: { variant: 'outline', label: 'Pending Verification' },
    not_connected: { variant: 'destructive', label: 'Not Connected' },
  };
  const config = variants[status] || variants.not_connected;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const PaymentsSettingsPanel = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { setApiKey, loading } = useSecureApiKeys();
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  const [formData, setFormData] = useState({
    stripe_secret_key: '',
    stripe_publishable_key: '',
    stripe_webhook_secret: '',
    pricelabs_api_key: '',
  });

  const [configuredKeys, setConfiguredKeys] = useState({
    stripe_secret_key: false,
    stripe_publishable_key: false,
    stripe_webhook_secret: false,
    pricelabs_api_key: false,
  });

  useEffect(() => {
    if (organization) {
      setConfiguredKeys({
        stripe_secret_key: !!(organization as any).has_stripe_configured,
        stripe_publishable_key: !!(organization as any).has_stripe_publishable_configured,
        stripe_webhook_secret: !!(organization as any).has_stripe_webhook_configured,
        pricelabs_api_key: !!(organization as any).has_pricelabs_configured,
      });
    }
  }, [organization]);

  // Check connect status on mount and when returning from Stripe
  useEffect(() => {
    if (organization?.id && (organization as any).stripe_connect_id) {
      checkConnectStatus();
    }
  }, [organization?.id]);

  // Handle return from Stripe Connect onboarding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_connect') === 'complete') {
      checkConnectStatus();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkConnectStatus = async () => {
    if (!organization?.id) return;
    setCheckingStatus(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('stripe-connect-status', {
        body: { organizationId: organization.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.data && !res.error) {
        setConnectStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to check connect status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!organization?.id) return;
    setConnectLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: {
          organizationId: organization.id,
          returnUrl: window.location.origin + '/admin/settings/payments',
        },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      
      if (res.error) throw new Error(res.error.message || 'Failed to start onboarding');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect Stripe');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleUpdateStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    let success = true;
    
    if (formData.stripe_secret_key) {
      success = await setApiKey(organization.id, 'stripe_secret_key', formData.stripe_secret_key) && success;
    }
    if (formData.stripe_publishable_key) {
      success = await setApiKey(organization.id, 'stripe_publishable_key', formData.stripe_publishable_key) && success;
    }
    if (formData.stripe_webhook_secret) {
      success = await setApiKey(organization.id, 'stripe_webhook_secret', formData.stripe_webhook_secret) && success;
    }

    if (success) {
      setFormData(prev => ({
        ...prev,
        stripe_secret_key: '',
        stripe_publishable_key: '',
        stripe_webhook_secret: '',
      }));
      refetch();
    }
  };

  const handleUpdatePriceLabs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    if (formData.pricelabs_api_key) {
      const success = await setApiKey(organization.id, 'pricelabs_api_key', formData.pricelabs_api_key);
      if (success) {
        setFormData(prev => ({ ...prev, pricelabs_api_key: '' }));
        refetch();
      }
    }
  };

  if (!organization) {
    return <div className="text-center py-8">No organization found</div>;
  }

  const orgAny = organization as any;
  const currentConnectStatus = connectStatus?.status || orgAny.stripe_connect_status || 'not_connected';
  const isConnectActive = currentConnectStatus === 'active';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <Shield className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-300">
          API keys are encrypted at rest using AES-256-GCM encryption
        </span>
      </div>

      <Tabs defaultValue="connect" className="w-full">
        <TabsList>
          <TabsTrigger value="connect" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Stripe Connect
          </TabsTrigger>
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Stripe Keys (Legacy)
          </TabsTrigger>
          <TabsTrigger value="pricelabs" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            PriceLabs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Stripe Connect
                    <ConnectStatusBadge status={currentConnectStatus} />
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Connect your Stripe account to accept payments. A 10% platform fee is automatically deducted from each booking.
                  </CardDescription>
                </div>
                {isConnectActive && (
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center gap-1 hover:underline"
                  >
                    Stripe Dashboard <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnectActive ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <p className="text-sm text-muted-foreground">Charges</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Enabled
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <p className="text-sm text-muted-foreground">Payouts</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Enabled
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                    <p className="text-lg font-semibold">{orgAny.platform_fee_percent || 10}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically deducted from each guest payment
                    </p>
                  </div>
                  <Button variant="outline" onClick={checkConnectStatus} disabled={checkingStatus}>
                    {checkingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Refresh Status
                  </Button>
                </div>
              ) : currentConnectStatus === 'pending' || currentConnectStatus === 'pending_verification' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {currentConnectStatus === 'pending_verification'
                        ? 'Your Stripe account is being verified. This usually takes 1-2 business days.'
                        : 'You haven\'t completed the Stripe onboarding yet. Click below to continue.'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleConnectStripe} disabled={connectLoading}>
                      {connectLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Continue Onboarding
                    </Button>
                    <Button variant="outline" onClick={checkConnectStatus} disabled={checkingStatus}>
                      {checkingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Refresh Status
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">How it works</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Connect your existing Stripe account to receive guest payments</li>
                      <li>• A 10% platform fee is automatically deducted from each booking</li>
                      <li>• The remaining 90% is deposited directly to your bank account</li>
                      <li>• You manage refunds and disputes from your own Stripe dashboard</li>
                    </ul>
                  </div>
                  {isOrgAdmin() && (
                    <Button onClick={handleConnectStripe} disabled={connectLoading} size="lg">
                      {connectLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="mr-2 h-4 w-4" />
                      )}
                      Connect Stripe Account
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization-Wide Stripe Configuration (Legacy)</CardTitle>
              <CardDescription>
                Direct Stripe API keys. Use Stripe Connect instead for automatic split payments.
                Only use this if you need full control over your Stripe integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateStripe} className="space-y-4">
                <div>
                  <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                  <Input
                    id="stripe_secret_key"
                    type="password"
                    placeholder={configuredKeys.stripe_secret_key ? '••••••••••••••••' : 'sk_live_...'}
                    value={formData.stripe_secret_key}
                    onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })}
                    disabled={!isOrgAdmin() || loading}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={configuredKeys.stripe_secret_key} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stripe_publishable_key">Stripe Publishable Key</Label>
                  <Input
                    id="stripe_publishable_key"
                    placeholder={configuredKeys.stripe_publishable_key ? '••••••••••••••••' : 'pk_live_...'}
                    value={formData.stripe_publishable_key}
                    onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })}
                    disabled={!isOrgAdmin() || loading}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={configuredKeys.stripe_publishable_key} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stripe_webhook_secret">Stripe Webhook Secret</Label>
                  <Input
                    id="stripe_webhook_secret"
                    type="password"
                    placeholder={configuredKeys.stripe_webhook_secret ? '••••••••••••••••' : 'whsec_...'}
                    value={formData.stripe_webhook_secret}
                    onChange={(e) => setFormData({ ...formData, stripe_webhook_secret: e.target.value })}
                    disabled={!isOrgAdmin() || loading}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={configuredKeys.stripe_webhook_secret} />
                  </div>
                </div>
                {isOrgAdmin() && (
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Encrypting & Saving...
                      </>
                    ) : (
                      'Update Stripe Settings'
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricelabs" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PriceLabs API Key</CardTitle>
              <CardDescription>
                Configure PriceLabs API key for dynamic pricing sync across all properties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePriceLabs} className="space-y-4">
                <div>
                  <Label htmlFor="pricelabs_api_key">PriceLabs API Key</Label>
                  <Input
                    id="pricelabs_api_key"
                    type="password"
                    placeholder={configuredKeys.pricelabs_api_key ? '••••••••••••••••' : 'Enter your PriceLabs API key'}
                    value={formData.pricelabs_api_key}
                    onChange={(e) => setFormData({ ...formData, pricelabs_api_key: e.target.value })}
                    disabled={!isOrgAdmin() || loading}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={configuredKeys.pricelabs_api_key} />
                  </div>
                </div>
                {isOrgAdmin() && (
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Encrypting & Saving...
                      </>
                    ) : (
                      'Update PriceLabs Settings'
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
          
          <PriceLabsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentsSettingsPanel;
