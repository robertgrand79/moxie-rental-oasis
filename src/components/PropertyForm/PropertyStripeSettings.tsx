import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Property } from '@/types/property';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2, Trash2, Copy, Check, Save } from 'lucide-react';

interface PropertyStripeSettingsProps {
  property: Property;
}

type StripeField = 'stripe_secret_key' | 'stripe_publishable_key' | 'stripe_webhook_secret' | 'stripe_account_id';

export const PropertyStripeSettings = ({ property }: PropertyStripeSettingsProps) => {
  const [formData, setFormData] = useState({
    stripeSecretKey: '',
    stripePublishableKey: '',
    stripeWebhookSecret: '',
    stripeAccountId: '',
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingField, setSavingField] = useState<StripeField | null>(null);
  const [clearing, setClearing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasStripeConfigured, setHasStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const webhookUrl = "https://joiovubyokikqjytxtuv.supabase.co/functions/v1/handle-stripe-webhook";

  // Check if property has Stripe credentials configured (securely)
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

  const handleCopyWebhookUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('Webhook URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveField = async (fieldName: string, fieldValue: string, dbColumn: StripeField, formKey: keyof typeof formData) => {
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
      // Use upsert to create or update the credentials
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
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Processing
        </CardTitle>
        <CardDescription>
          Configure Stripe for this specific property. These settings override your organization's default Stripe account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Only configure property-specific Stripe if this property uses a different Stripe account (e.g., separate LLC). 
            Leave empty to use your organization's default Stripe account.
          </AlertDescription>
        </Alert>

        {hasStripeConfigured && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              This property has custom Stripe settings configured. Use the individual "Update" buttons to update specific fields.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Secret Key */}
          <div className="space-y-2">
            <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="stripeSecretKey"
                  type={showSecretKey ? 'text' : 'password'}
                  placeholder="sk_live_..."
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
                  className="shrink-0"
                >
                  {savingField === 'stripe_secret_key' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="ml-1">Update</span>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Found in your Stripe Dashboard → Developers → API keys</p>
          </div>

          {/* Publishable Key */}
          <div className="space-y-2">
            <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
            <div className="flex gap-2">
              <Input
                id="stripePublishableKey"
                type="text"
                placeholder="pk_live_..."
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
                  className="shrink-0"
                >
                  {savingField === 'stripe_publishable_key' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="ml-1">Update</span>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">This key is safe to expose in frontend code</p>
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label>Webhook Endpoint URL</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={webhookUrl}
                className="font-mono text-xs bg-muted"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyWebhookUrl}
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this URL when creating a webhook in Stripe Dashboard. Select events: {' '}
              <code className="bg-muted px-1 rounded">checkout.session.completed</code>, {' '}
              <code className="bg-muted px-1 rounded">checkout.session.expired</code>, {' '}
              <code className="bg-muted px-1 rounded">payment_intent.payment_failed</code>
            </p>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="stripeWebhookSecret">Stripe Webhook Secret</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="stripeWebhookSecret"
                  type={showWebhookSecret ? 'text' : 'password'}
                  placeholder="whsec_..."
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
                  className="shrink-0"
                >
                  {savingField === 'stripe_webhook_secret' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="ml-1">Update</span>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Found in Stripe Dashboard → Developers → Webhooks → Select endpoint → Signing secret</p>
          </div>

          {/* Account ID */}
          <div className="space-y-2">
            <Label htmlFor="stripeAccountId">Stripe Account ID (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="stripeAccountId"
                type="text"
                placeholder="acct_..."
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
                  className="shrink-0"
                >
                  {savingField === 'stripe_account_id' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="ml-1">Update</span>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Only needed for Stripe Connect setups</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {!hasStripeConfigured && (
            <Button type="button" onClick={handleSave} disabled={isAnySaving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Payment Settings'
              )}
            </Button>
          )}
          {hasStripeConfigured && (
            <Button type="button" variant="outline" onClick={handleClear} disabled={isAnySaving}>
              {clearing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Settings
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
