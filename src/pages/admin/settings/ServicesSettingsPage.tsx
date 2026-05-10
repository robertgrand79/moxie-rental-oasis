import React, { useState, useEffect } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, AlertCircle, Loader2, Plug, KeyRound } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';

const ConfigStatus = ({ configured }: { configured: boolean }) => (
  <Badge variant={configured ? 'default' : 'secondary'} className="gap-1">
    {configured ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
    {configured ? 'Configured' : 'Not configured'}
  </Badge>
);

const ServicesSettingsPage = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { setApiKey, loading } = useSecureApiKeys();
  const [formData, setFormData] = useState({
    turno_api_token: '',
    turno_api_secret: '',
    turno_partner_id: '',
    openweather_api_key: '',
  });
  const [configuredKeys, setConfiguredKeys] = useState({
    turno_api_token: false,
    turno_api_secret: false,
    turno_partner_id: false,
    openweather_api_key: false,
  });

  useEffect(() => {
    if (organization) {
      const org = organization as any;
      setConfiguredKeys({
        turno_api_token: !!org.turno_api_token,
        turno_api_secret: !!org.turno_api_secret,
        turno_partner_id: !!org.turno_partner_id,
        openweather_api_key: !!org.openweather_api_key,
      });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    let success = true;
    if (formData.turno_api_token) success = await setApiKey(organization.id, 'turno_api_token', formData.turno_api_token) && success;
    if (formData.turno_api_secret) success = await setApiKey(organization.id, 'turno_api_secret', formData.turno_api_secret) && success;
    if (formData.turno_partner_id) success = await setApiKey(organization.id, 'turno_partner_id', formData.turno_partner_id) && success;
    if (formData.openweather_api_key) success = await setApiKey(organization.id, 'openweather_api_key', formData.openweather_api_key) && success;
    if (success) {
      setFormData({ turno_api_token: '', turno_api_secret: '', turno_partner_id: '', openweather_api_key: '' });
      refetch();
    }
  };

  if (!organization) return <SettingsSidebarLayout title="Services" description="Third-party services" icon={Plug}><div className="text-center py-8">No organization found</div></SettingsSidebarLayout>;

  const hasTurnoConnection = configuredKeys.turno_api_token && configuredKeys.turno_api_secret;

  return (
    <SettingsSidebarLayout title="Services" description="Customer-owned service integrations" icon={Plug}>
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            API keys are encrypted at rest. Stay Moxie now uses each organization&apos;s own Turno account and credentials only.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Services</CardTitle>
                <CardDescription>Configure Turno and OpenWeather integrations.</CardDescription>
              </div>
              <ConfigStatus configured={hasTurnoConnection} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert>
                <KeyRound className="h-4 w-4" />
                <AlertDescription>
                  The customer should create and pay for their own Turno account, then paste their own API token and API secret here.
                  Turno sync will stay disabled until both fields are configured for this organization.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="turno_api_token">Turno API Token</Label>
                <Input
                  id="turno_api_token"
                  type="password"
                  placeholder={configuredKeys.turno_api_token ? '••••••••' : 'Enter the customer-owned Turno API token'}
                  value={formData.turno_api_token}
                  onChange={(e) => setFormData({ ...formData, turno_api_token: e.target.value })}
                  disabled={!isOrgAdmin() || loading}
                />
                <p className="text-sm text-muted-foreground">
                  This token belongs to this organization&apos;s own Turno account.
                </p>
                <ConfigStatus configured={configuredKeys.turno_api_token} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turno_api_secret">Turno API Secret</Label>
                <Input
                  id="turno_api_secret"
                  type="password"
                  placeholder={configuredKeys.turno_api_secret ? '••••••••' : 'Enter the customer-owned Turno API secret'}
                  value={formData.turno_api_secret}
                  onChange={(e) => setFormData({ ...formData, turno_api_secret: e.target.value })}
                  disabled={!isOrgAdmin() || loading}
                />
                <p className="text-sm text-muted-foreground">
                  Required together with the Turno token for connection testing, property sync, and problem sync.
                </p>
                <ConfigStatus configured={configuredKeys.turno_api_secret} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turno_partner_id">Turno Partner ID (optional)</Label>
                <Input
                  id="turno_partner_id"
                  placeholder={configuredKeys.turno_partner_id ? '••••••••' : 'Optional partner ID from Turno'}
                  value={formData.turno_partner_id}
                  onChange={(e) => setFormData({ ...formData, turno_partner_id: e.target.value })}
                  disabled={!isOrgAdmin() || loading}
                />
                <p className="text-sm text-muted-foreground">
                  Only add this if Turno issued a partner ID for this customer account.
                </p>
                <ConfigStatus configured={configuredKeys.turno_partner_id} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openweather_api_key">OpenWeather API Key</Label>
                <Input
                  id="openweather_api_key"
                  type="password"
                  placeholder={configuredKeys.openweather_api_key ? '••••••••' : 'Enter key'}
                  value={formData.openweather_api_key}
                  onChange={(e) => setFormData({ ...formData, openweather_api_key: e.target.value })}
                  disabled={!isOrgAdmin() || loading}
                />
                <ConfigStatus configured={configuredKeys.openweather_api_key} />
              </div>

              {isOrgAdmin() && <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Settings'}</Button>}
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsSidebarLayout>
  );
};

export default ServicesSettingsPage;
