import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Lock, Plug, CheckCircle2, AlertCircle, Map, Bot, Shield, Loader2, Copy, ExternalLink } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import AssistantSettingsTab from '@/components/admin/settings/AssistantSettingsTab';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { setApiKey, loading } = useSecureApiKeys();
  const { settings, saveSetting } = useSimplifiedSiteSettings();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    openphone_api_key: '',
    openphone_phone_number: '',
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

  const [configuredKeys, setConfiguredKeys] = useState({
    openphone_api_key: false,
    resend_api_key: false,
    seam_api_key: false,
    turno_api_token: false,
    apify_api_key: false,
    openweather_api_key: false,
  });

  useEffect(() => {
    if (organization) {
      const org = organization as typeof organization & {
        openphone_api_key?: string;
        openphone_phone_number?: string;
        resend_api_key?: string;
        seam_api_key?: string;
        turno_api_token?: string;
        apify_api_key?: string;
        openweather_api_key?: string;
      };
      
      setConfiguredKeys({
        openphone_api_key: !!org.openphone_api_key,
        resend_api_key: !!org.resend_api_key,
        seam_api_key: !!org.seam_api_key,
        turno_api_token: !!org.turno_api_token,
        apify_api_key: !!org.apify_api_key,
        openweather_api_key: !!org.openweather_api_key,
      });
      
      setFormData(prev => ({
        ...prev,
        openphone_phone_number: org.openphone_phone_number || '',
        mapboxToken: settings?.mapboxToken || '',
      }));
    }
  }, [organization, settings]);

  const openphoneWebhookUrl = organization 
    ? `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/openphone-webhook?org=${organization.id}`
    : '';

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(openphoneWebhookUrl);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  const handleUpdateCommunications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    let success = true;
    
    if (formData.openphone_api_key) {
      success = await setApiKey(organization.id, 'openphone_api_key', formData.openphone_api_key) && success;
    }
    if (formData.resend_api_key) {
      success = await setApiKey(organization.id, 'resend_api_key', formData.resend_api_key) && success;
    }
    
    // Update phone number directly in organizations table
    if (formData.openphone_phone_number !== (organization as any).openphone_phone_number) {
      const { error } = await supabase
        .from('organizations')
        .update({ openphone_phone_number: formData.openphone_phone_number })
        .eq('id', organization.id);
      
      if (error) {
        console.error('Error updating phone number:', error);
        success = false;
      }
    }

    if (success) {
      setFormData(prev => ({
        ...prev,
        openphone_api_key: '',
        resend_api_key: '',
      }));
      refetch();
      toast({
        title: "Settings saved",
        description: "Communications settings updated successfully",
      });
    }
  };

  const handleUpdateSmartHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    let success = true;
    
    if (formData.seam_api_key) {
      success = await setApiKey(organization.id, 'seam_api_key', formData.seam_api_key) && success;
    }
    // Note: seam_webhook_secret is not in ALLOWED_KEYS, storing via regular update if needed
    
    if (success) {
      setFormData(prev => ({
        ...prev,
        seam_api_key: '',
        seam_webhook_secret: '',
      }));
      refetch();
    }
  };

  const handleUpdateIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    let success = true;
    
    if (formData.turno_api_token) {
      success = await setApiKey(organization.id, 'turno_api_key', formData.turno_api_token) && success;
    }
    if (formData.apify_api_key) {
      success = await setApiKey(organization.id, 'apify_api_key', formData.apify_api_key) && success;
    }
    if (formData.openweather_api_key) {
      success = await setApiKey(organization.id, 'openweather_api_key', formData.openweather_api_key) && success;
    }

    if (success) {
      setFormData(prev => ({
        ...prev,
        turno_api_token: '',
        turno_api_secret: '',
        turno_partner_id: '',
        apify_api_key: '',
        openweather_api_key: '',
      }));
      refetch();
    }
  };

  const handleUpdateMaps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    
    if (formData.mapboxToken) {
      const success = await setApiKey(organization.id, 'mapbox_api_key', formData.mapboxToken);
      if (success) {
        await saveSetting('mapboxToken', formData.mapboxToken);
      }
    }
  };

  if (!organization) {
    return <div className="text-center py-8">No organization found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <Shield className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-300">
          API keys are encrypted at rest using AES-256-GCM encryption
        </span>
      </div>

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
              <form onSubmit={handleUpdateCommunications} className="space-y-6">
                {/* OpenPhone Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">OpenPhone SMS</h4>
                  
                  <div>
                    <Label htmlFor="openphone_api_key">OpenPhone API Key</Label>
                    <Input
                      id="openphone_api_key"
                      type="password"
                      placeholder={configuredKeys.openphone_api_key ? '••••••••••••••••' : 'Enter your OpenPhone API key'}
                      value={formData.openphone_api_key}
                      onChange={(e) => setFormData({ ...formData, openphone_api_key: e.target.value })}
                      disabled={!isOrgAdmin() || loading}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={configuredKeys.openphone_api_key} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="openphone_phone_number">OpenPhone Phone Number</Label>
                    <Input
                      id="openphone_phone_number"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.openphone_phone_number}
                      onChange={(e) => setFormData({ ...formData, openphone_phone_number: e.target.value })}
                      disabled={!isOrgAdmin() || loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your OpenPhone number used for sending/receiving SMS
                    </p>
                  </div>

                  <div>
                    <Label>Webhook URL (for inbound SMS)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={openphoneWebhookUrl}
                        readOnly
                        className="font-mono text-xs bg-muted"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copyWebhookUrl}
                        title="Copy webhook URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs space-y-1">
                      <p className="font-medium">To receive inbound SMS in your inbox:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Go to OpenPhone Settings → Webhooks</li>
                        <li>Click "Add Webhook"</li>
                        <li>Paste the webhook URL above</li>
                        <li>Select event: <code className="bg-background px-1 rounded">message.received</code></li>
                        <li>Save the webhook</li>
                      </ol>
                      <a 
                        href="https://www.openphone.com/docs/webhooks" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        OpenPhone Webhooks Documentation
                      </a>
                    </div>
                  </div>
                </div>

                {/* Resend Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Resend Email</h4>
                  <div>
                    <Label htmlFor="resend_api_key">Resend API Key</Label>
                    <Input
                      id="resend_api_key"
                      type="password"
                      placeholder={configuredKeys.resend_api_key ? '••••••••••••••••' : 'Enter your Resend API key'}
                      value={formData.resend_api_key}
                      onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
                      disabled={!isOrgAdmin() || loading}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={configuredKeys.resend_api_key} />
                    </div>
                  </div>
                </div>

                {isOrgAdmin() && (
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Encrypting & Saving...
                      </>
                    ) : (
                      'Update Communications Settings'
                    )}
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
                        Encrypting & Saving...
                      </>
                    ) : (
                      'Update Smart Home Settings'
                    )}
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
                      placeholder={configuredKeys.turno_api_token ? '••••••••••••••••' : 'Enter your Turno API token'}
                      value={formData.turno_api_token}
                      onChange={(e) => setFormData({ ...formData, turno_api_token: e.target.value })}
                      disabled={!isOrgAdmin() || loading}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={configuredKeys.turno_api_token} />
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
                      disabled={!isOrgAdmin() || loading}
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
                    disabled={!isOrgAdmin() || loading}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="apify_api_key">Apify API Key</Label>
                    <Input
                      id="apify_api_key"
                      type="password"
                      placeholder={configuredKeys.apify_api_key ? '••••••••••••••••' : 'Enter your Apify API key'}
                      value={formData.apify_api_key}
                      onChange={(e) => setFormData({ ...formData, apify_api_key: e.target.value })}
                      disabled={!isOrgAdmin() || loading}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={configuredKeys.apify_api_key} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="openweather_api_key">OpenWeather API Key</Label>
                    <Input
                      id="openweather_api_key"
                      type="password"
                      placeholder={configuredKeys.openweather_api_key ? '••••••••••••••••' : 'Enter your OpenWeather API key'}
                      value={formData.openweather_api_key}
                      onChange={(e) => setFormData({ ...formData, openweather_api_key: e.target.value })}
                      disabled={!isOrgAdmin() || loading}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={configuredKeys.openweather_api_key} />
                    </div>
                  </div>
                </div>
                {isOrgAdmin() && (
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Encrypting & Saving...
                      </>
                    ) : (
                      'Update Service Settings'
                    )}
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
                    disabled={!isOrgAdmin() || loading}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={!!settings?.mapboxToken} />
                  </div>
                </div>
                {isOrgAdmin() && (
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Encrypting & Saving...
                      </>
                    ) : (
                      'Update Map Settings'
                    )}
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
