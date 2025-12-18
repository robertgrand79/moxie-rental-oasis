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

const ServicesSettingsPage = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { setApiKey, loading } = useSecureApiKeys();
  const [formData, setFormData] = useState({ turno_api_token: '', apify_api_key: '', openweather_api_key: '' });
  const [configuredKeys, setConfiguredKeys] = useState({ turno_api_token: false, apify_api_key: false, openweather_api_key: false });

  useEffect(() => {
    if (organization) {
      const org = organization as any;
      setConfiguredKeys({ turno_api_token: !!org.turno_api_token, apify_api_key: !!org.apify_api_key, openweather_api_key: !!org.openweather_api_key });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    let success = true;
    if (formData.turno_api_token) success = await setApiKey(organization.id, 'turno_api_key', formData.turno_api_token) && success;
    if (formData.apify_api_key) success = await setApiKey(organization.id, 'apify_api_key', formData.apify_api_key) && success;
    if (formData.openweather_api_key) success = await setApiKey(organization.id, 'openweather_api_key', formData.openweather_api_key) && success;
    if (success) { setFormData({ turno_api_token: '', apify_api_key: '', openweather_api_key: '' }); refetch(); }
  };

  if (!organization) return <SettingsSidebarLayout title="Services" description="Third-party services"><div className="text-center py-8">No organization found</div></SettingsSidebarLayout>;

  return (
    <SettingsSidebarLayout title="Services" description="Third-party service integrations">
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Shield className="h-5 w-5 text-green-600" /><span className="text-sm text-green-700 dark:text-green-300">API keys are encrypted at rest</span>
        </div>
        <Card>
          <CardHeader><CardTitle>Services</CardTitle><CardDescription>Configure Turno, Apify, and OpenWeather.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Turno API Key</Label><Input type="password" placeholder={configuredKeys.turno_api_token ? '••••••••' : 'Enter key'} value={formData.turno_api_token} onChange={(e) => setFormData({ ...formData, turno_api_token: e.target.value })} disabled={!isOrgAdmin() || loading} /><ConfigStatus configured={configuredKeys.turno_api_token} /></div>
              <div><Label>Apify API Key</Label><Input type="password" placeholder={configuredKeys.apify_api_key ? '••••••••' : 'Enter key'} value={formData.apify_api_key} onChange={(e) => setFormData({ ...formData, apify_api_key: e.target.value })} disabled={!isOrgAdmin() || loading} /><ConfigStatus configured={configuredKeys.apify_api_key} /></div>
              <div><Label>OpenWeather API Key</Label><Input type="password" placeholder={configuredKeys.openweather_api_key ? '••••••••' : 'Enter key'} value={formData.openweather_api_key} onChange={(e) => setFormData({ ...formData, openweather_api_key: e.target.value })} disabled={!isOrgAdmin() || loading} /><ConfigStatus configured={configuredKeys.openweather_api_key} /></div>
              {isOrgAdmin() && <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Settings'}</Button>}
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsSidebarLayout>
  );
};

export default ServicesSettingsPage;
