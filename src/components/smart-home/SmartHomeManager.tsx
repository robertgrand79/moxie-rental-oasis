import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/types/property';
import { Home, Lock, Thermometer, Wifi, Battery, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DeviceGrid } from './DeviceGrid';
import { AccessCodeManager } from './AccessCodeManager';
import { DeviceAutomations } from './DeviceAutomations';
import { debug } from '@/utils/debug';

interface SmartHomeManagerProps {
  property: Property;
}

interface SeamWorkspace {
  id: string;
  workspace_id: string;
  workspace_name: string;
  api_key_configured: boolean;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
}

/**
 * Represents the current state of a smart device
 */
interface DeviceCurrentState {
  locked?: boolean;
  temperature?: number;
  humidity?: number;
  target_temperature?: number;
  hvac_mode?: 'heat' | 'cool' | 'auto' | 'off';
  fan_mode?: 'auto' | 'on';
  [key: string]: unknown; // Allow additional device-specific properties
}

interface SeamDevice {
  id: string;
  seam_device_id: string;
  device_type: string;
  device_brand: string;
  device_name: string;
  location: string | null;
  is_online: boolean;
  battery_level: number | null;
  battery_status: string | null;
  current_state: DeviceCurrentState | null;
  last_seen_at: string | null;
}

export const SmartHomeManager = ({ property }: SmartHomeManagerProps) => {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<SeamWorkspace | null>(null);
  const [devices, setDevices] = useState<SeamDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadWorkspaceAndDevices();
  }, [property.id]);

  const loadWorkspaceAndDevices = async () => {
    try {
      setLoading(true);

      // Load workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('seam_workspaces')
        .select('*')
        .eq('property_id', property.id)
        .eq('is_active', true)
        .maybeSingle();

      if (workspaceError && workspaceError.code !== 'PGRST116') {
        throw workspaceError;
      }

      setWorkspace(workspaceData);

      // Load devices if workspace exists
      if (workspaceData) {
        const { data: devicesData, error: devicesError } = await supabase
          .from('seam_devices')
          .select('*')
          .eq('property_id', property.id)
          .order('device_name');

        if (devicesError) {
          throw devicesError;
        }

        // Map database response to typed interface
        const typedDevices: SeamDevice[] = (devicesData || []).map(d => ({
          ...d,
          current_state: d.current_state as DeviceCurrentState | null
        }));

        setDevices(typedDevices);
      }

    } catch (error) {
      debug.error('[SmartHome] Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load smart home data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDevices = async () => {
    if (!workspace) return;

    try {
      setSyncing(true);
      
      const { data, error } = await supabase.functions.invoke('seam-sync', {
        body: {
          workspaceId: workspace.workspace_id,
          propertyId: property.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Synced ${data.deviceCount} devices from Seam`,
      });

      // Reload devices
      await loadWorkspaceAndDevices();

    } catch (error) {
      debug.error('[SmartHome] Error syncing devices:', error);
      toast({
        title: "Error",
        description: "Failed to sync devices from Seam",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getDeviceStats = () => {
    const locks = devices.filter(d => d.device_type === 'smart_lock');
    const thermostats = devices.filter(d => d.device_type === 'thermostat');
    const online = devices.filter(d => d.is_online);
    const lowBattery = devices.filter(d => 
      d.battery_level && d.battery_level < 20
    );

    return {
      total: devices.length,
      locks: locks.length,
      thermostats: thermostats.length,
      online: online.length,
      lowBattery: lowBattery.length
    };
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Smart Home Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading smart home data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show message to configure in settings if no workspace
  if (!workspace) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Smart Home Management
          </CardTitle>
          <CardDescription>
            Connect your Seam workspace to manage smart locks and thermostats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-medium text-lg">No Workspace Connected</h3>
              <p className="text-muted-foreground mt-1">
                Configure your Seam workspace in Settings → Smart Home to manage smart devices for this property.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/settings/smart-home')}
            >
              Go to Smart Home Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getDeviceStats();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Smart Home Management
            </CardTitle>
            <CardDescription>
              Manage smart devices for {property.title}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={workspace.api_key_configured ? "default" : "secondary"}>
              {workspace.workspace_name}
            </Badge>
            <Button
              onClick={handleSyncDevices}
              disabled={syncing}
              size="sm"
              variant="outline"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Devices
            </Button>
          </div>
        </div>

        {/* Device Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Home className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Devices</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Lock className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{stats.locks}</div>
              <div className="text-xs text-muted-foreground">Smart Locks</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Thermometer className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold">{stats.thermostats}</div>
              <div className="text-xs text-muted-foreground">Thermostats</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Wifi className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{stats.online}</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
          </div>

          {stats.lowBattery > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <Battery className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-700">{stats.lowBattery}</div>
                <div className="text-xs text-yellow-600">Low Battery</div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Access Codes
            </TabsTrigger>
            <TabsTrigger value="automations" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Automations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DeviceGrid devices={devices} onDeviceUpdate={loadWorkspaceAndDevices} />
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <DeviceGrid devices={devices} onDeviceUpdate={loadWorkspaceAndDevices} detailed />
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <AccessCodeManager 
              property={property}
              devices={devices.filter(d => d.device_type === 'smart_lock')}
            />
          </TabsContent>

          <TabsContent value="automations" className="space-y-6">
            <DeviceAutomations property={property} devices={devices} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
