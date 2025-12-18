import React, { useState, useEffect } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';

const ConfigStatus = ({ configured }: { configured: boolean }) => (
  <span className={`flex items-center gap-1 text-sm ${configured ? 'text-green-600' : 'text-muted-foreground'}`}>
    {configured ? <><CheckCircle2 className="h-4 w-4" />Configured</> : <><AlertCircle className="h-4 w-4" />Not configured</>}
  </span>
);

const StripeSettingsPage = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { setApiKey, loading } = useSecureApiKeys();
  const [formData, setFormData] = useState({ stripe_secret_key: '', stripe_publishable_key: '', stripe_webhook_secret: '' });
  const [configuredKeys, setConfiguredKeys] = useState({ stripe_secret_key: false, stripe_publishable_key: false, stripe_webhook_secret: false });

  useEffect(() => {
    if (organization) {
      setConfiguredKeys({
        stripe_secret_key: !!organization.stripe_secret_key,
        stripe_publishable_key: !!organization.stripe_publishable_key,
        stripe_webhook_secret: !!organization.stripe_webhook_secret,
      });
    }
  }, [organization]);

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
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Shield className="h-5 w-5 text-green-600" /><span className="text-sm text-green-700 dark:text-green-300">API keys are encrypted at rest</span>
        </div>
        <Card>
          <CardHeader><CardTitle>Stripe Configuration</CardTitle><CardDescription>Configure Stripe for payment processing.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Stripe Secret Key</Label><Input type="password" placeholder={configuredKeys.stripe_secret_key ? '••••••••' : 'sk_live_...'} value={formData.stripe_secret_key} onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })} disabled={!isOrgAdmin() || loading} /><ConfigStatus configured={configuredKeys.stripe_secret_key} /></div>
              <div><Label>Stripe Publishable Key</Label><Input placeholder={configuredKeys.stripe_publishable_key ? '••••••••' : 'pk_live_...'} value={formData.stripe_publishable_key} onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })} disabled={!isOrgAdmin() || loading} /><ConfigStatus configured={configuredKeys.stripe_publishable_key} /></div>
              <div><Label>Stripe Webhook Secret</Label><Input type="password" placeholder={configuredKeys.stripe_webhook_secret ? '••••••••' : 'whsec_...'} value={formData.stripe_webhook_secret} onChange={(e) => setFormData({ ...formData, stripe_webhook_secret: e.target.value })} disabled={!isOrgAdmin() || loading} /><ConfigStatus configured={configuredKeys.stripe_webhook_secret} /></div>
              {isOrgAdmin() && <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Settings'}</Button>}
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsSidebarLayout>
  );
};

export default StripeSettingsPage;
