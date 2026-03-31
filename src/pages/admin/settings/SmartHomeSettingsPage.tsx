import React, { useState, useEffect } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, CheckCircle2, AlertCircle, Loader2, Home, RefreshCw, Trash2, ExternalLink, Copy, Check, Info } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Property } from '@/types/property';
import { useNavigate } from 'react-router-dom';

const WEBHOOK_URL = "https://joiovubyokikqjytxtuv.supabase.co/functions/v1/seam-webhook";

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

interface SeamWorkspace {
  id: string;
  property_id: string;
  workspace_id: string;
  workspace_name: string;
  api_key_configured: boolean;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
}

interface PropertySmartHomeCardProps {
  property: Property;
  workspace: SeamWorkspace | null;
  onWorkspaceCreated: () => void;
  onWorkspaceDisconnected: () => void;
  onSyncDevices: () => void;
  syncing: boolean;
  deviceCount: number;
}

const PropertySmartHomeCard = ({ 
  property, 
  workspace, 
  onWorkspaceCreated, 
  onWorkspaceDisconnected,
  onSyncDevices,
  syncing,
  deviceCount
}: PropertySmartHomeCardProps) => {
  const navigate = useNavigate();
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = async () => {
    if (!workspaceId || !workspaceName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setConnecting(true);

      const { error } = await supabase
        .from('seam_workspaces')
        .insert({
          property_id: property.id,
          workspace_id: workspaceId.trim(),
          workspace_name: workspaceName.trim(),
          api_key_configured: true,
          is_active: true,
          sync_status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This workspace ID is already connected to another property');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Seam workspace connected successfully');
      setWorkspaceId('');
      setWorkspaceName('');
      onWorkspaceCreated();
    } catch (error) {
      console.error('Error connecting workspace:', error);
      toast.error('Failed to connect Seam workspace');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!workspace) return;

    try {
      setDisconnecting(true);

      const { error } = await supabase
        .from('seam_workspaces')
        .update({ is_active: false })
        .eq('id', workspace.id);

      if (error) throw error;

      toast.success('Workspace disconnected');
      onWorkspaceDisconnected();
    } catch (error) {
      console.error('Error disconnecting workspace:', error);
      toast.error('Failed to disconnect workspace');
    } finally {
      setDisconnecting(false);
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never synced';
    const date = new Date(lastSync);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4 pt-2">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Connect this property's smart devices (August locks, Honeywell thermostats) via Seam workspace.
        </AlertDescription>
      </Alert>

      {workspace ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Workspace connected: {workspace.workspace_name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Workspace ID</Label>
              <p className="font-mono text-sm">{workspace.workspace_id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Devices</Label>
              <p className="text-sm">{deviceCount} devices synced</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Last Sync</Label>
              <p className="text-sm">{formatLastSync(workspace.last_sync_at)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Status</Label>
              <Badge variant={workspace.sync_status === 'synced' ? 'default' : 'secondary'}>
                {workspace.sync_status}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onSyncDevices}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Devices
            </Button>
            <Button
              onClick={() => navigate(`/admin/properties/${property.id}/edit?tab=smart-home`)}
              variant="outline"
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Manage Devices
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={disconnecting}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              {disconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor={`workspace-id-${property.id}`}>Workspace ID *</Label>
              <Input
                id={`workspace-id-${property.id}`}
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                placeholder="e.g., ws_abc123..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find this in your Seam dashboard under Workspace Settings
              </p>
            </div>
            <div>
              <Label htmlFor={`workspace-name-${property.id}`}>Workspace Name *</Label>
              <Input
                id={`workspace-name-${property.id}`}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g., Property Name - Smart Devices"
              />
              <p className="text-xs text-muted-foreground mt-1">
                A friendly name to identify this workspace
              </p>
            </div>
          </div>

          <Button
            onClick={handleConnect}
            disabled={connecting || !workspaceId || !workspaceName}
            size="sm"
          >
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Home className="h-4 w-4 mr-2" />
                Connect Workspace
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const SmartHomeSettingsPage = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { setApiKey, loading: apiKeyLoading } = useSecureApiKeys();
  const { properties } = usePropertyFetch();
  
  const [formData, setFormData] = useState({
    seam_api_key: '',
    seam_webhook_secret: '',
  });

  const [configuredKeys, setConfiguredKeys] = useState({
    seam_api_key: false,
  });

  const [workspaces, setWorkspaces] = useState<SeamWorkspace[]>([]);
  const [deviceCounts, setDeviceCounts] = useState<Record<string, number>>({});
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [syncingProperty, setSyncingProperty] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (organization) {
      setConfiguredKeys({
        seam_api_key: !!(organization as any).has_seam_configured,
      });
    }
  }, [organization]);

  useEffect(() => {
    if (properties.length > 0) {
      loadWorkspacesAndDevices();
    }
  }, [properties]);

  const loadWorkspacesAndDevices = async () => {
    try {
      setLoadingWorkspaces(true);
      const propertyIds = properties.map(p => p.id);

      // Load workspaces
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('seam_workspaces')
        .select('*')
        .in('property_id', propertyIds)
        .eq('is_active', true);

      if (workspacesError) throw workspacesError;
      setWorkspaces(workspacesData || []);

      // Load device counts
      const { data: devicesData, error: devicesError } = await supabase
        .from('seam_devices')
        .select('property_id')
        .in('property_id', propertyIds);

      if (devicesError) throw devicesError;

      const counts: Record<string, number> = {};
      (devicesData || []).forEach(device => {
        counts[device.property_id] = (counts[device.property_id] || 0) + 1;
      });
      setDeviceCounts(counts);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

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

  const handleSyncDevices = async (propertyId: string, workspaceId: string) => {
    try {
      setSyncingProperty(propertyId);
      
      const { data, error } = await supabase.functions.invoke('seam-sync', {
        body: {
          workspaceId: workspaceId,
          propertyId: propertyId
        }
      });

      if (error) throw error;

      toast.success(`Synced ${data?.deviceCount || 0} devices`);
      await loadWorkspacesAndDevices();
    } catch (error) {
      console.error('Error syncing devices:', error);
      toast.error('Failed to sync devices');
    } finally {
      setSyncingProperty(null);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    toast.success('Webhook URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getWorkspaceForProperty = (propertyId: string) => {
    return workspaces.find(w => w.property_id === propertyId) || null;
  };

  if (!organization) {
    return (
      <SettingsSidebarLayout title="Smart Home" description="Configure smart home integrations" icon={Home}>
        <div className="text-center py-8">No organization found</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout title="Smart Home" description="Configure smart home integrations" icon={Home}>
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300">
            API keys are encrypted at rest using AES-256-GCM encryption
          </span>
        </div>

        {/* Organization SEAM Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Organization SEAM Settings</CardTitle>
            <CardDescription>
              Default SEAM API key used for all properties. Individual properties use workspaces connected to this key.
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
                  disabled={!isOrgAdmin() || apiKeyLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in your Seam dashboard under API Keys
                </p>
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
                  disabled={!isOrgAdmin() || apiKeyLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to verify webhook events from Seam
                </p>
              </div>

              {isOrgAdmin() && (
                <Button type="submit" disabled={apiKeyLoading}>
                  {apiKeyLoading ? (
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

        {/* Property Smart Home Configurations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Smart Home Configurations
            </CardTitle>
            <CardDescription>
              Configure SEAM workspaces for each property to manage smart locks and thermostats
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingWorkspaces ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading workspaces...
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No properties found. Add properties first to configure smart home devices.
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {properties.map((property) => {
                  const workspace = getWorkspaceForProperty(property.id);
                  const hasWorkspace = !!workspace;
                  
                  return (
                    <AccordionItem key={property.id} value={property.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 w-full pr-4">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{property.title}</span>
                          <Badge 
                            variant={hasWorkspace ? "default" : "secondary"}
                            className="ml-auto"
                          >
                            {hasWorkspace ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Connected
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not Configured
                              </>
                            )}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <PropertySmartHomeCard
                          property={property}
                          workspace={workspace}
                          onWorkspaceCreated={loadWorkspacesAndDevices}
                          onWorkspaceDisconnected={loadWorkspacesAndDevices}
                          onSyncDevices={() => workspace && handleSyncDevices(property.id, workspace.workspace_id)}
                          syncing={syncingProperty === property.id}
                          deviceCount={deviceCounts[property.id] || 0}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>
              Configure webhooks in your Seam dashboard to receive device events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Webhook Endpoint URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={WEBHOOK_URL}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add this URL as a webhook endpoint in your Seam dashboard
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Required Webhook Events</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">device.connected</Badge>
                <Badge variant="outline">device.disconnected</Badge>
                <Badge variant="outline">lock.locked</Badge>
                <Badge variant="outline">lock.unlocked</Badge>
                <Badge variant="outline">access_code.created</Badge>
                <Badge variant="outline">access_code.deleted</Badge>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <a 
                    href="https://docs.seam.co/latest/core-concepts/webhooks" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    View Seam Webhook Documentation
                  </a>
                  <p className="text-muted-foreground mt-1">
                    Learn how to configure webhooks in your Seam dashboard
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsSidebarLayout>
  );
};

export default SmartHomeSettingsPage;
