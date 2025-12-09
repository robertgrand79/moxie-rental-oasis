import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Lock, Plug, CheckCircle2, AlertCircle, Map, Bot } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import AssistantSettingsTab from '@/components/admin/settings/AssistantSettingsTab';

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

const IntegrationsSettingsPanel = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { updateOrganization, updating } = useOrganizationOperations();
  const { settings, saveSetting } = useStableSiteSettings();
  
  const [formData, setFormData] = useState({
    openphone_api_key: '',
    resend_api_key: '',
    seam_api_key: '',
    seam_webhook_secret: '',
    turno_api_token: '',
    turno_api_secret: '',
    turno_partner_id: '',
    apify_api_key: '',
    openweather_api_key: '',
    mapboxToken: '',
  });

  useEffect(() => {
    if (organization) {
      setFormData(prev => ({
        ...prev,
        mapboxToken: settings?.mapboxToken || '',
      }));
    }
  }, [organization, settings]);

  const org = organization as typeof organization & {
    openphone_api_key?: string;
    resend_api_key?: string;
    seam_api_key?: string;
    seam_webhook_secret?: string;
    turno_api_token?: string;
    turno_api_secret?: string;
    turno_partner_id?: string;
    apify_api_key?: string;
    openweather_api_key?: string;
  };

  const handleUpdateCommunications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    await updateOrganization(organization.id, {
      openphone_api_key: formData.openphone_api_key || undefined,
      resend_api_key: formData.resend_api_key || undefined,
    });
    refetch();
  };

  const handleUpdateSmartHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    await updateOrganization(organization.id, {
      seam_api_key: formData.seam_api_key || undefined,
      seam_webhook_secret: formData.seam_webhook_secret || undefined,
    });
    refetch();
  };

  const handleUpdateIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    await updateOrganization(organization.id, {
      turno_api_token: formData.turno_api_token || undefined,
      turno_api_secret: formData.turno_api_secret || undefined,
      turno_partner_id: formData.turno_partner_id || undefined,
      apify_api_key: formData.apify_api_key || undefined,
      openweather_api_key: formData.openweather_api_key || undefined,
    });
    refetch();
  };

  const handleUpdateMaps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mapboxToken) {
      await saveSetting('mapboxToken', formData.mapboxToken);
    }
  };

  if (!organization) {
    return <div className="text-center py-8">No organization found</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ai-assistant" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="smarthome" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Smart Home
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="maps" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Maps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-assistant" className="mt-6">
          <AssistantSettingsTab />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Communications</CardTitle>
              <CardDescription>
                Configure SMS (OpenPhone) and Email (Resend) API keys for guest messaging.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCommunications} className="space-y-4">
                <div>
                  <Label htmlFor="openphone_api_key">OpenPhone API Key</Label>
                  <Input
                    id="openphone_api_key"
                    type="password"
                    placeholder="Enter your OpenPhone API key"
                    value={formData.openphone_api_key}
                    onChange={(e) => setFormData({ ...formData, openphone_api_key: e.target.value })}
                    disabled={!isOrgAdmin()}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={!!org?.openphone_api_key} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="resend_api_key">Resend API Key</Label>
                  <Input
                    id="resend_api_key"
                    type="password"
                    placeholder="Enter your Resend API key"
                    value={formData.resend_api_key}
                    onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
                    disabled={!isOrgAdmin()}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={!!org?.resend_api_key} />
                  </div>
                </div>
                {isOrgAdmin() && (
                  <Button type="submit" disabled={updating}>
                    {updating ? 'Saving...' : 'Update Communications Settings'}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smarthome" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Home (SEAM)</CardTitle>
              <CardDescription>
                Configure SEAM API for smart lock and device management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSmartHome} className="space-y-4">
                <div>
                  <Label htmlFor="seam_api_key">SEAM API Key</Label>
                  <Input
                    id="seam_api_key"
                    type="password"
                    placeholder="Enter your SEAM API key"
                    value={formData.seam_api_key}
                    onChange={(e) => setFormData({ ...formData, seam_api_key: e.target.value })}
                    disabled={!isOrgAdmin()}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={!!org?.seam_api_key} />
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
                    disabled={!isOrgAdmin()}
                  />
                </div>
                {isOrgAdmin() && (
                  <Button type="submit" disabled={updating}>
                    {updating ? 'Saving...' : 'Update Smart Home Settings'}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
              <CardDescription>
                Configure Turno (field service), Apify (scraping), and OpenWeather API keys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateIntegrations} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="turno_api_token">Turno API Token</Label>
                    <Input
                      id="turno_api_token"
                      type="password"
                      placeholder="Enter your Turno API token"
                      value={formData.turno_api_token}
                      onChange={(e) => setFormData({ ...formData, turno_api_token: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org?.turno_api_token} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="turno_api_secret">Turno API Secret</Label>
                    <Input
                      id="turno_api_secret"
                      type="password"
                      placeholder="Enter your Turno API secret"
                      value={formData.turno_api_secret}
                      onChange={(e) => setFormData({ ...formData, turno_api_secret: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="turno_partner_id">Turno Partner ID</Label>
                  <Input
                    id="turno_partner_id"
                    placeholder="Enter your Turno partner ID"
                    value={formData.turno_partner_id}
                    onChange={(e) => setFormData({ ...formData, turno_partner_id: e.target.value })}
                    disabled={!isOrgAdmin()}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="apify_api_key">Apify API Key</Label>
                    <Input
                      id="apify_api_key"
                      type="password"
                      placeholder="Enter your Apify API key"
                      value={formData.apify_api_key}
                      onChange={(e) => setFormData({ ...formData, apify_api_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org?.apify_api_key} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="openweather_api_key">OpenWeather API Key</Label>
                    <Input
                      id="openweather_api_key"
                      type="password"
                      placeholder="Enter your OpenWeather API key"
                      value={formData.openweather_api_key}
                      onChange={(e) => setFormData({ ...formData, openweather_api_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org?.openweather_api_key} />
                    </div>
                  </div>
                </div>
                {isOrgAdmin() && (
                  <Button type="submit" disabled={updating}>
                    {updating ? 'Saving...' : 'Update Service Settings'}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Map Configuration</CardTitle>
              <CardDescription>
                Configure Mapbox for property maps and location features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateMaps} className="space-y-4">
                <div>
                  <Label htmlFor="mapboxToken">Mapbox Access Token</Label>
                  <Input
                    id="mapboxToken"
                    type="password"
                    placeholder="pk...."
                    value={formData.mapboxToken}
                    onChange={(e) => setFormData({ ...formData, mapboxToken: e.target.value })}
                    disabled={!isOrgAdmin()}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={!!settings?.mapboxToken} />
                  </div>
                </div>
                {isOrgAdmin() && (
                  <Button type="submit" disabled={updating}>
                    {updating ? 'Saving...' : 'Update Map Settings'}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsSettingsPanel;
