import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Property } from '@/types/property';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2, Trash2 } from 'lucide-react';

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

  // Check if property has Stripe configured (we can't see the actual keys, but we can check if they exist)
  const hasStripeConfigured = !!(property as any).stripe_secret_key || !!(property as any).stripe_publishable_key;

  const handleSave = async () => {
    if (!formData.stripeSecretKey && !formData.stripePublishableKey) {
      toast.error('Please enter at least a Secret Key and Publishable Key');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          stripe_secret_key: formData.stripeSecretKey || null,
          stripe_publishable_key: formData.stripePublishableKey || null,
          stripe_webhook_secret: formData.stripeWebhookSecret || null,
          stripe_account_id: formData.stripeAccountId || null,
        })
        .eq('id', property.id);

      if (error) throw error;

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
        .from('properties')
        .update({
          stripe_secret_key: null,
          stripe_publishable_key: null,
          stripe_webhook_secret: null,
          stripe_account_id: null,
        })
        .eq('id', property.id);

      if (error) throw error;

      toast.success('Stripe settings cleared - will use organization defaults');
    } catch (error) {
      console.error('Error clearing Stripe settings:', error);
      toast.error('Failed to clear Stripe settings');
    } finally {
      setClearing(false);
    }
  };

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
          <Button onClick={handleSave} disabled={saving || clearing}>
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
            <Button variant="outline" onClick={handleClear} disabled={saving || clearing}>
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
