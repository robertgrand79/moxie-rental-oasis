import React, { useState, useEffect } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle2, AlertCircle, Loader2, Copy, Check, ChevronDown, Building2, Home, Trash2, Eye, EyeOff, Save, Info } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Property } from '@/types/property';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WEBHOOK_URL = "https://joiovubyokikqjytxtuv.supabase.co/functions/v1/handle-stripe-webhook";

const ConfigStatus = ({ configured }: { configured: boolean }) => (
  <span className={`flex items-center gap-1 text-sm ${configured ? 'text-green-600' : 'text-muted-foreground'}`}>
    {configured ? <><CheckCircle2 className="h-4 w-4" />Configured</> : <><AlertCircle className="h-4 w-4" />Not configured</>}
  </span>
);

// Property Stripe Settings Card Component
const PropertyStripeCard = ({ property }: { property: Property }) => {
  const [formData, setFormData] = useState({
    stripeSecretKey: '',
    stripePublishableKey: '',
    stripeWebhookSecret: '',
    stripeAccountId: '',
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [hasStripeConfigured, setHasStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStripeConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('property_stripe_credentials')
          .select('id')
          .eq('property_id', property.id)
          .maybeSingle();

        if (!error && data) {
          setHasStripeConfigured(true);
        }
      } catch (err) {
        console.error('Error checking Stripe config:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStripeConfig();
  }, [property.id]);

  const handleSaveField = async (fieldName: string, fieldValue: string, dbColumn: string, formKey: keyof typeof formData) => {
    if (!fieldValue.trim()) {
      toast.error(`Please enter a value for ${fieldName}`);
      return;
    }

    setSavingField(dbColumn);
    try {
      const { error } = await supabase
        .from('property_stripe_credentials')
        .update({ 
          [dbColumn]: fieldValue, 
          updated_at: new Date().toISOString() 
        })
        .eq('property_id', property.id);

      if (error) throw error;
      
      toast.success(`${fieldName} updated successfully`);
      setFormData(prev => ({ ...prev, [formKey]: '' }));
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      toast.error(`Failed to update ${fieldName}`);
    } finally {
      setSavingField(null);
    }
  };

  const handleSave = async () => {
    if (!formData.stripeSecretKey && !formData.stripePublishableKey) {
      toast.error('Please enter at least a Secret Key and Publishable Key');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('property_stripe_credentials')
        .upsert({
          property_id: property.id,
          stripe_secret_key: formData.stripeSecretKey || null,
          stripe_publishable_key: formData.stripePublishableKey || null,
          stripe_webhook_secret: formData.stripeWebhookSecret || null,
          stripe_account_id: formData.stripeAccountId || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'property_id'
        });

      if (error) throw error;

      setHasStripeConfigured(true);
      toast.success('Stripe settings saved successfully');
      setFormData({
        stripeSecretKey: '',
        stripePublishableKey: '',
        stripeWebhookSecret: '',
        stripeAccountId: '',
      });
    } catch (error) {
      console.error('Error saving Stripe settings:', error);
      toast.error('Failed to save Stripe settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const { error } = await supabase
        .from('property_stripe_credentials')
        .delete()
        .eq('property_id', property.id);

      if (error) throw error;

      setHasStripeConfigured(false);
      toast.success('Stripe settings cleared - will use organization defaults');
    } catch (error) {
      console.error('Error clearing Stripe settings:', error);
      toast.error('Failed to clear Stripe settings');
    } finally {
      setClearing(false);
    }
  };

  const isAnySaving = saving || clearing || savingField !== null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Only configure property-specific Stripe if this property uses a different Stripe account (e.g., separate LLC). 
          Leave empty to use your organization's default Stripe account.
        </AlertDescription>
      </Alert>

      {hasStripeConfigured && (
        <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300">Custom Stripe account configured</span>
        </div>
      )}

      <div className="grid gap-4">
        {/* Secret Key */}
        <div className="space-y-2">
          <Label>Stripe Secret Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showSecretKey ? 'text' : 'password'}
                placeholder={hasStripeConfigured ? '••••••••' : 'sk_live_...'}
                value={formData.stripeSecretKey}
                onChange={(e) => setFormData(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {hasStripeConfigured && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleSaveField('Secret Key', formData.stripeSecretKey, 'stripe_secret_key', 'stripeSecretKey')}
                disabled={isAnySaving || !formData.stripeSecretKey.trim()}
              >
                {savingField === 'stripe_secret_key' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Found in your Stripe Dashboard → Developers → API keys</p>
        </div>

        {/* Publishable Key */}
        <div className="space-y-2">
          <Label>Stripe Publishable Key</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={hasStripeConfigured ? '••••••••' : 'pk_live_...'}
              value={formData.stripePublishableKey}
              onChange={(e) => setFormData(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
              className="flex-1"
            />
            {hasStripeConfigured && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleSaveField('Publishable Key', formData.stripePublishableKey, 'stripe_publishable_key', 'stripePublishableKey')}
                disabled={isAnySaving || !formData.stripePublishableKey.trim()}
              >
                {savingField === 'stripe_publishable_key' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">This key is safe to expose in frontend code</p>
        </div>

        {/* Webhook Secret */}
        <div className="space-y-2">
          <Label>Stripe Webhook Secret</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showWebhookSecret ? 'text' : 'password'}
                placeholder={hasStripeConfigured ? '••••••••' : 'whsec_...'}
                value={formData.stripeWebhookSecret}
                onChange={(e) => setFormData(prev => ({ ...prev, stripeWebhookSecret: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {hasStripeConfigured && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleSaveField('Webhook Secret', formData.stripeWebhookSecret, 'stripe_webhook_secret', 'stripeWebhookSecret')}
                disabled={isAnySaving || !formData.stripeWebhookSecret.trim()}
              >
                {savingField === 'stripe_webhook_secret' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Found in Stripe Dashboard → Developers → Webhooks → Select endpoint → Signing secret</p>
        </div>

        {/* Account ID */}
        <div className="space-y-2">
          <Label>Stripe Account ID (Optional)</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={hasStripeConfigured ? '••••••••' : 'acct_...'}
              value={formData.stripeAccountId}
              onChange={(e) => setFormData(prev => ({ ...prev, stripeAccountId: e.target.value }))}
              className="flex-1"
            />
            {hasStripeConfigured && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleSaveField('Account ID', formData.stripeAccountId, 'stripe_account_id', 'stripeAccountId')}
                disabled={isAnySaving || !formData.stripeAccountId.trim()}
              >
                {savingField === 'stripe_account_id' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Only needed for Stripe Connect setups</p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {!hasStripeConfigured && (
          <Button type="button" onClick={handleSave} disabled={isAnySaving} size="sm">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Settings'}
          </Button>
        )}
        {hasStripeConfigured && (
          <Button type="button" variant="outline" onClick={handleClear} disabled={isAnySaving} size="sm">
            {clearing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Clearing...</> : <><Trash2 className="h-4 w-4 mr-2" />Clear Settings</>}
          </Button>
        )}
      </div>
    </div>
  );
};

const StripeSettingsPage = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { setApiKey, loading } = useSecureApiKeys();
  const { properties, loading: propertiesLoading } = usePropertyFetch();
  const [formData, setFormData] = useState({ stripe_secret_key: '', stripe_publishable_key: '', stripe_webhook_secret: '' });
  const [configuredKeys, setConfiguredKeys] = useState({ stripe_secret_key: false, stripe_publishable_key: false, stripe_webhook_secret: false });
  const [copied, setCopied] = useState(false);
  const [propertyConfigs, setPropertyConfigs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (organization) {
      setConfiguredKeys({
        stripe_secret_key: !!organization.stripe_secret_key,
        stripe_publishable_key: !!organization.stripe_publishable_key,
        stripe_webhook_secret: !!organization.stripe_webhook_secret,
      });
    }
  }, [organization]);

  // Fetch property Stripe configurations
  useEffect(() => {
    const fetchPropertyConfigs = async () => {
      if (properties.length === 0) return;
      
      const { data } = await supabase
        .from('property_stripe_credentials')
        .select('property_id')
        .in('property_id', properties.map(p => p.id));
      
      if (data) {
        const configs: Record<string, boolean> = {};
        data.forEach(item => {
          configs[item.property_id] = true;
        });
        setPropertyConfigs(configs);
      }
    };

    fetchPropertyConfigs();
  }, [properties]);

  const handleCopyWebhookUrl = async () => {
    await navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    toast.success('Webhook URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    let success = true;
    if (formData.stripe_secret_key) success = await setApiKey(organization.id, 'stripe_secret_key', formData.stripe_secret_key) && success;
    if (formData.stripe_publishable_key) success = await setApiKey(organization.id, 'stripe_publishable_key', formData.stripe_publishable_key) && success;
    if (formData.stripe_webhook_secret) success = await setApiKey(organization.id, 'stripe_webhook_secret', formData.stripe_webhook_secret) && success;
    if (success) { setFormData({ stripe_secret_key: '', stripe_publishable_key: '', stripe_webhook_secret: '' }); refetch(); }
  };

  if (!organization) return <SettingsSidebarLayout title="Stripe" description="Payment processing"><div className="text-center py-8">No organization found</div></SettingsSidebarLayout>;

  return (
    <SettingsSidebarLayout title="Stripe" description="Configure payment processing">
      <div className="space-y-6">
        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300">API keys are encrypted at rest</span>
        </div>

        {/* Organization Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Default Settings
            </CardTitle>
            <CardDescription>
              These settings are used when a property doesn't have its own Stripe configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Stripe Secret Key</Label>
                <Input type="password" placeholder={configuredKeys.stripe_secret_key ? '••••••••' : 'sk_live_...'} value={formData.stripe_secret_key} onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })} disabled={!isOrgAdmin() || loading} />
                <ConfigStatus configured={configuredKeys.stripe_secret_key} />
              </div>
              <div>
                <Label>Stripe Publishable Key</Label>
                <Input placeholder={configuredKeys.stripe_publishable_key ? '••••••••' : 'pk_live_...'} value={formData.stripe_publishable_key} onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })} disabled={!isOrgAdmin() || loading} />
                <ConfigStatus configured={configuredKeys.stripe_publishable_key} />
              </div>
              <div>
                <Label>Stripe Webhook Secret</Label>
                <Input type="password" placeholder={configuredKeys.stripe_webhook_secret ? '••••••••' : 'whsec_...'} value={formData.stripe_webhook_secret} onChange={(e) => setFormData({ ...formData, stripe_webhook_secret: e.target.value })} disabled={!isOrgAdmin() || loading} />
                <ConfigStatus configured={configuredKeys.stripe_webhook_secret} />
              </div>
              {isOrgAdmin() && <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Organization Settings'}</Button>}
            </form>
          </CardContent>
        </Card>

        {/* Property Stripe Configurations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Payment Settings
            </CardTitle>
            <CardDescription>
              Configure separate Stripe accounts for individual properties (e.g., different LLCs). Properties without custom settings will use the organization defaults above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {propertiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No properties found. Add properties to configure individual payment settings.
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {properties.map((property) => (
                  <AccordionItem key={property.id} value={property.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium">{property.title}</span>
                        <Badge variant={propertyConfigs[property.id] ? 'default' : 'secondary'} className="ml-auto mr-2">
                          {propertyConfigs[property.id] ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Custom</>
                          ) : (
                            <><AlertCircle className="h-3 w-3 mr-1" />Using Default</>
                          )}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <PropertyStripeCard property={property} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>
              Use this endpoint URL when setting up webhooks in your Stripe Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook Endpoint URL</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={WEBHOOK_URL} className="font-mono text-xs bg-muted" />
                <Button type="button" variant="outline" size="icon" onClick={handleCopyWebhookUrl}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Required webhook events:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-muted px-1 rounded text-xs">checkout.session.completed</code></li>
                <li><code className="bg-muted px-1 rounded text-xs">checkout.session.expired</code></li>
                <li><code className="bg-muted px-1 rounded text-xs">payment_intent.payment_failed</code></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsSidebarLayout>
  );
};

export default StripeSettingsPage;
