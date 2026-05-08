import { useEffect, useState } from 'react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Home, Shield, KeyRound, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';

interface Props {
  onComplete: (data?: Record<string, any>) => void;
  isCompleting: boolean;
}

interface SeamWorkspace {
  id: string;
  workspace_id: string;
  workspace_name: string;
  sync_status: string;
  last_sync_at: string | null;
}

const OnboardingPropertyStep = ({ onComplete, isCompleting }: Props) => {
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  const { properties, refetch: refetchProperties } = usePropertyFetch();
  const { setApiKey, loading: apiKeyLoading } = useSecureApiKeys();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [maxGuests, setMaxGuests] = useState('2');
  const [saving, setSaving] = useState(false);

  const [phase, setPhase] = useState<'property' | 'seam'>('property');
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [createdPropertyTitle, setCreatedPropertyTitle] = useState<string>('');

  const [seamApiKey, setSeamApiKeyInput] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspace, setWorkspace] = useState<SeamWorkspace | null>(null);
  const [deviceCount, setDeviceCount] = useState(0);
  const [loadingSeam, setLoadingSeam] = useState(false);
  const [savingSeam, setSavingSeam] = useState(false);
  const [syncingSeam, setSyncingSeam] = useState(false);

  useEffect(() => {
    const existingProperty = properties[0];

    if (existingProperty) {
      setCreatedPropertyId(existingProperty.id);
      setCreatedPropertyTitle(existingProperty.title || 'Your property');
      setPhase('seam');
    }
  }, [properties]);

  useEffect(() => {
    if (createdPropertyId) {
      loadSeamState(createdPropertyId);
    }
  }, [createdPropertyId]);

  const loadSeamState = async (propertyId: string) => {
    try {
      setLoadingSeam(true);

      const [{ data: workspaceData, error: workspaceError }, { data: devicesData, error: devicesError }] = await Promise.all([
        supabase
          .from('seam_workspaces')
          .select('*')
          .eq('property_id', propertyId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('seam_devices')
          .select('id', { count: 'exact' })
          .eq('property_id', propertyId),
      ]);

      if (workspaceError && workspaceError.code !== 'PGRST116') {
        throw workspaceError;
      }

      if (devicesError) {
        throw devicesError;
      }

      setWorkspace((workspaceData as SeamWorkspace | null) || null);
      setDeviceCount(devicesData?.length || 0);

      if (workspaceData) {
        setWorkspaceId(workspaceData.workspace_id || '');
        setWorkspaceName(workspaceData.workspace_name || '');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to load Seam setup', variant: 'destructive' });
    } finally {
      setLoadingSeam(false);
    }
  };

  const handleSave = async () => {
    if (!organization || !title || !location) return;
    setSaving(true);

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { data, error } = await supabase
        .from('properties')
        .insert({
          title,
          location,
          description: description || 'Beautiful vacation rental',
          bedrooms: parseInt(bedrooms) || 1,
          bathrooms: parseInt(bathrooms) || 1,
          max_guests: parseInt(maxGuests) || 2,
          organization_id: organization.id,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedPropertyId(data.id);
      setCreatedPropertyTitle(data.title || title);
      setPhase('seam');
      await refetchProperties();

      toast({
        title: 'Property added!',
        description: 'Now connect Seam so guest codes and device automation can work automatically.',
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncDevices = async (overrideWorkspaceId?: string) => {
    if (!createdPropertyId) return;

    const effectiveWorkspaceId = overrideWorkspaceId || workspace?.workspace_id || workspaceId;
    if (!effectiveWorkspaceId) return;

    try {
      setSyncingSeam(true);

      const { data, error } = await supabase.functions.invoke('seam-sync', {
        body: {
          workspaceId: effectiveWorkspaceId,
          propertyId: createdPropertyId,
          organizationId: organization?.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Devices synced',
        description: `Imported ${data?.deviceCount || 0} Seam device${data?.deviceCount === 1 ? '' : 's'}.`,
      });

      await loadSeamState(createdPropertyId);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to sync Seam devices', variant: 'destructive' });
    } finally {
      setSyncingSeam(false);
    }
  };

  const handleSaveSeamAndContinue = async () => {
    if (!organization || !createdPropertyId) return;

    if (!workspace && (!workspaceId.trim() || !workspaceName.trim())) {
      toast({
        title: 'Missing workspace details',
        description: 'Enter a Seam workspace ID and workspace name, or skip for now.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingSeam(true);

      if (seamApiKey.trim()) {
        const saved = await setApiKey(organization.id, 'seam_api_key', seamApiKey.trim());
        if (!saved) {
          setSavingSeam(false);
          return;
        }
      }

      let effectiveWorkspaceId = workspace?.workspace_id || workspaceId.trim();

      if (!workspace) {
        const { data: workspaceRecord, error: workspaceError } = await supabase
          .from('seam_workspaces')
          .insert({
            property_id: createdPropertyId,
            workspace_id: workspaceId.trim(),
            workspace_name: workspaceName.trim(),
            api_key_configured: true,
            is_active: true,
            sync_status: 'pending',
          })
          .select()
          .single();

        if (workspaceError) throw workspaceError;

        setWorkspace(workspaceRecord as SeamWorkspace);
        effectiveWorkspaceId = workspaceRecord.workspace_id;
      }

      await handleSyncDevices(effectiveWorkspaceId);

      onComplete({
        propertyId: createdPropertyId,
        title: createdPropertyTitle,
        seamConfigured: true,
        workspaceId: effectiveWorkspaceId,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to connect Seam', variant: 'destructive' });
    } finally {
      setSavingSeam(false);
    }
  };

  const handleSkipSeam = () => {
    onComplete({
      propertyId: createdPropertyId,
      title: createdPropertyTitle,
      seamConfigured: false,
    });
  };

  if (phase === 'seam' && createdPropertyId) {
    return (
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Connect Seam now so Stay Moxie can create guest access codes automatically and sync your smart locks and thermostats.
          </AlertDescription>
        </Alert>

        <div className="rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-4 w-4 text-primary" />
            <span className="font-medium">{createdPropertyTitle}</span>
            {workspace && (
              <Badge variant="secondary">
                Seam Connected
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Finish smart-home setup for this property now, or skip and return later from Settings or the property editor.
          </p>
        </div>

        {loadingSeam ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Seam setup...
          </div>
        ) : (
          <>
            {!workspace && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="seam_api_key">Seam API Key</Label>
                  <Input
                    id="seam_api_key"
                    type="password"
                    placeholder="Enter your Seam API key"
                    value={seamApiKey}
                    onChange={(e) => setSeamApiKeyInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is optional here if you already saved it in Smart Home settings. If not, enter it now so device sync can work immediately.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workspace_id">Workspace ID</Label>
                  <Input
                    id="workspace_id"
                    placeholder="e.g. ws_abc123..."
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workspace_name">Workspace Name</Label>
                  <Input
                    id="workspace_name"
                    placeholder={`${createdPropertyTitle} Smart Home`}
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {workspace && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{workspace.workspace_name}</span>
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>Workspace ID: <span className="font-mono text-foreground">{workspace.workspace_id}</span></div>
                  <div>Devices synced: <span className="text-foreground">{deviceCount}</span></div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSyncDevices()}
                  disabled={syncingSeam}
                >
                  {syncingSeam ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Devices Again
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSaveSeamAndContinue}
            disabled={savingSeam || syncingSeam || apiKeyLoading || isCompleting || loadingSeam}
          >
            {savingSeam || apiKeyLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Seam...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4 mr-2" />
                {workspace ? 'Continue with Seam Connected' : 'Connect Seam & Continue'}
              </>
            )}
          </Button>

          <Button variant="ghost" onClick={handleSkipSeam} disabled={savingSeam || syncingSeam || isCompleting}>
            Skip Seam for now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add your first property. Right after this, you can connect Seam for guest codes and smart-home automation without leaving onboarding.
      </p>

      <div className="space-y-2">
        <Label htmlFor="title">Property Name *</Label>
        <Input
          id="title"
          placeholder="Beachfront Paradise"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          placeholder="123 Beach Rd, Miami, FL"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your property..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            step="0.5"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxGuests">Max Guests</Label>
          <Input
            id="maxGuests"
            type="number"
            min="1"
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || isCompleting || !title || !location}>
          {saving || isCompleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Property & Set Up Seam'
          )}
        </Button>
        <Button variant="ghost" onClick={() => onComplete()}>
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPropertyStep;
