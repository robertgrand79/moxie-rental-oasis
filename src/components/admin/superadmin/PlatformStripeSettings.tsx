import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Eye, EyeOff, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { toast } from 'sonner';

const PlatformStripeSettings = () => {
  const { settings, loadingSettings, updateSetting, isUpdating } = usePlatformSettings();
  
  const [secretKey, setSecretKey] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Load current values
  useEffect(() => {
    if (settings) {
      const sk = settings.find(s => s.key === 'platform_stripe_secret_key')?.value || '';
      const pk = settings.find(s => s.key === 'platform_stripe_publishable_key')?.value || '';
      const wh = settings.find(s => s.key === 'platform_stripe_webhook_secret')?.value || '';
      setSecretKey(sk);
      setPublishableKey(pk);
      setWebhookSecret(wh);
    }
  }, [settings]);

  const webhookUrl = `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/platform-subscription-webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSave = async () => {
    await updateSetting.mutateAsync({ key: 'platform_stripe_secret_key', value: secretKey });
    await updateSetting.mutateAsync({ key: 'platform_stripe_publishable_key', value: publishableKey });
    await updateSetting.mutateAsync({ key: 'platform_stripe_webhook_secret', value: webhookSecret });
  };

  const maskValue = (value: string) => {
    if (!value || value.length < 10) return value;
    return `${value.substring(0, 7)}...${value.substring(value.length - 4)}`;
  };

  const isConfigured = (value: string | null | undefined) => !!value && value.length > 0;

  if (loadingSettings) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Platform Stripe Configuration
        </CardTitle>
        <CardDescription>
          Configure Stripe API keys for collecting SaaS subscription fees from tenants.
          This is separate from tenant-level Stripe keys used for property bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Secret Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="secret-key">Secret Key</Label>
            {isConfigured(secretKey) ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configured
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Not configured
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="secret-key"
                type={showSecretKey ? 'text' : 'password'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_..."
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSecretKey(!showSecretKey)}
            >
              {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Publishable Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="publishable-key">Publishable Key</Label>
            {isConfigured(publishableKey) ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configured
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Not configured
              </Badge>
            )}
          </div>
          <Input
            id="publishable-key"
            type="text"
            value={publishableKey}
            onChange={(e) => setPublishableKey(e.target.value)}
            placeholder="pk_live_..."
          />
        </div>

        {/* Webhook Secret */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="webhook-secret">Webhook Secret</Label>
            {isConfigured(webhookSecret) ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configured
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Not configured
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="webhook-secret"
                type={showWebhookSecret ? 'text' : 'password'}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="whsec_..."
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
            >
              {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Webhook URL */}
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(webhookUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Add this URL to your Stripe webhook settings. Select events: 
            <code className="mx-1">customer.subscription.created</code>,
            <code className="mx-1">customer.subscription.updated</code>,
            <code className="mx-1">customer.subscription.deleted</code>,
            <code className="mx-1">invoice.payment_succeeded</code>,
            <code className="mx-1">invoice.payment_failed</code>
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformStripeSettings;
