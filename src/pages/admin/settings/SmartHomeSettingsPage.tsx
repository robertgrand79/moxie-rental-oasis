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

const SmartHomeSettingsPage = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { setApiKey, loading } = useSecureApiKeys();
  
  const [formData, setFormData] = useState({
    seam_api_key: '',
    seam_webhook_secret: '',
  });

  const [configuredKeys, setConfiguredKeys] = useState({
    seam_api_key: false,
  });

  useEffect(() => {
    if (organization) {
      setConfiguredKeys({
        seam_api_key: !!(organization as any).seam_api_key,
      });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    let success = true;
    
    if (formData.seam_api_key) {
      success = await setApiKey(organization.id, 'seam_api_key', formData.seam_api_key) && success;
    }
    
    if (success) {
      setFormData(prev => ({
        ...prev,
        seam_api_key: '',
        seam_webhook_secret: '',
      }));
      refetch();
    }
  };

  if (!organization) {
    return (
      <SettingsSidebarLayout title="Smart Home" description="Configure smart home integrations">
        <div className="text-center py-8">No organization found</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout title="Smart Home" description="Configure smart home integrations">
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300">
            API keys are encrypted at rest using AES-256-GCM encryption
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>SEAM Integration</CardTitle>
            <CardDescription>
              Configure SEAM for smart lock and device management.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="seam_api_key">SEAM API Key</Label>
                <Input
                  id="seam_api_key"
                  type="password"
                  placeholder={configuredKeys.seam_api_key ? '••••••••••••••••' : 'Enter your SEAM API key'}
                  value={formData.seam_api_key}
                  onChange={(e) => setFormData({ ...formData, seam_api_key: e.target.value })}
                  disabled={!isOrgAdmin() || loading}
                />
                <div className="mt-1">
                  <ConfigStatus configured={configuredKeys.seam_api_key} />
                </div>
              </div>

              <div>
                <Label htmlFor="seam_webhook_secret">SEAM Webhook Secret</Label>
                <Input
                  id="seam_webhook_secret"
                  type="password"
                  placeholder="Enter your SEAM webhook secret"
                  value={formData.seam_webhook_secret}
                  onChange={(e) => setFormData({ ...formData, seam_webhook_secret: e.target.value })}
                  disabled={!isOrgAdmin() || loading}
                />
              </div>

              {isOrgAdmin() && (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsSidebarLayout>
  );
};

export default SmartHomeSettingsPage;
