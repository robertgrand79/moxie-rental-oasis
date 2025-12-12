import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Property } from '@/types/property';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2, Trash2, Copy, Check } from 'lucide-react';

interface PropertyStripeSettingsProps {
  property: Property;
}

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
              This property has custom Stripe settings configured. Enter new values below to update, or clear to use organization defaults.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
            <div className="relative">
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
            <p className="text-xs text-muted-foreground">Found in your Stripe Dashboard → Developers → API keys</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
            <Input
              id="stripePublishableKey"
              type="text"
              placeholder="pk_live_..."
              value={formData.stripePublishableKey}
              onChange={(e) => setFormData(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">This key is safe to expose in frontend code</p>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="stripeWebhookSecret">Stripe Webhook Secret</Label>
            <div className="relative">
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
            <p className="text-xs text-muted-foreground">Found in Stripe Dashboard → Developers → Webhooks → Select endpoint → Signing secret</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripeAccountId">Stripe Account ID (Optional)</Label>
            <Input
              id="stripeAccountId"
              type="text"
              placeholder="acct_..."
              value={formData.stripeAccountId}
              onChange={(e) => setFormData(prev => ({ ...prev, stripeAccountId: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Only needed for Stripe Connect setups</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={handleSave} disabled={saving || clearing}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Payment Settings'
            )}
          </Button>
          {hasStripeConfigured && (
            <Button type="button" variant="outline" onClick={handleClear} disabled={saving || clearing}>
              {clearing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Settings
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};