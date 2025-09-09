import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Thermometer, Wifi, WifiOff, Battery, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Device {
  id: string;
  seam_device_id: string;
  device_type: string;
  device_brand: string;
  device_name: string;
  location: string | null;
  is_online: boolean;
  battery_level: number | null;
  battery_status: string | null;
  current_state: any;
  last_seen_at: string | null;
}

interface DeviceGridProps {
  devices: Device[];
  onDeviceUpdate: () => void;
  detailed?: boolean;
}

export const DeviceGrid = ({ devices, onDeviceUpdate, detailed = false }: DeviceGridProps) => {
  const [controllingDevice, setControllingDevice] = React.useState<string | null>(null);

  const handleDeviceControl = async (device: Device, action: string, parameters?: any) => {
    try {
      setControllingDevice(device.id);

      const { data, error } = await supabase.functions.invoke('seam-device-control', {
        body: {
          deviceId: device.id,
          action,
          parameters
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully ${action.replace('_', ' ')} ${device.device_name}`,
      });

      // Refresh device data
      onDeviceUpdate();

    } catch (error) {
      console.error('Error controlling device:', error);
      toast({
        title: "Error",
        description: `Failed to ${action.replace('_', ' ')} device`,
        variant: "destructive",
      });
    } finally {
      setControllingDevice(null);
    }
  };

  const getDeviceIcon = (device: Device) => {
    switch (device.device_type) {
      case 'smart_lock':
        return device.current_state?.locked ? 
          <Lock className="h-5 w-5 text-red-500" /> : 
          <Unlock className="h-5 w-5 text-green-500" />;
      case 'thermostat':
        return <Thermometer className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBatteryIcon = (level: number | null, status: string | null) => {
    if (!level) return null;
    
    const color = level < 20 ? 'text-red-500' : level < 50 ? 'text-yellow-500' : 'text-green-500';
    return <Battery className={`h-4 w-4 ${color}`} />;
  };

  const renderDeviceControls = (device: Device) => {
    const isControlling = controllingDevice === device.id;

    if (device.device_type === 'smart_lock') {
      const isLocked = device.current_state?.locked;
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isLocked ? "destructive" : "default"}
            onClick={() => handleDeviceControl(device, isLocked ? 'unlock' : 'lock')}
            disabled={isControlling || !device.is_online}
          >
            {isLocked ? <Unlock className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
            {isLocked ? 'Unlock' : 'Lock'}
          </Button>
        </div>
      );
    }

    if (device.device_type === 'thermostat') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const temp = prompt('Enter temperature (°F):');
              if (temp && !isNaN(Number(temp))) {
                handleDeviceControl(device, 'set_temperature', { temperature: Number(temp) });
              }
            }}
            disabled={isControlling || !device.is_online}
          >
            <Thermometer className="h-4 w-4 mr-1" />
            Set Temp
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderDeviceState = (device: Device) => {
    if (device.device_type === 'smart_lock') {
      const isLocked = device.current_state?.locked;
      return (
        <Badge variant={isLocked ? "destructive" : "default"}>
          {isLocked ? 'Locked' : 'Unlocked'}
        </Badge>
      );
    }

    if (device.device_type === 'thermostat') {
      const temp = device.current_state?.temperature;
      const mode = device.current_state?.mode;
      return (
        <div className="flex gap-2">
          {temp && <Badge variant="outline">{temp}°F</Badge>}
          {mode && <Badge variant="secondary">{mode}</Badge>}
        </div>
      );
    }

    return null;
  };

  if (devices.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Smart Devices Found</h3>
        <p className="text-muted-foreground mb-4">
          Connect your August smart locks and Honeywell thermostats to get started.
        </p>
        <Button variant="outline">
          Sync Devices from Seam
        </Button>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${detailed ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {devices.map((device) => (
        <Card key={device.id} className={`${!device.is_online ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getDeviceIcon(device)}
                <div>
                  <CardTitle className="text-base">{device.device_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="capitalize">{device.device_brand}</span>
                    {device.location && (
                      <>
                        <span>•</span>
                        <span>{device.location}</span>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {device.is_online ? 
                  <Wifi className="h-4 w-4 text-green-500" /> : 
                  <WifiOff className="h-4 w-4 text-red-500" />
                }
                {device.battery_level && getBatteryIcon(device.battery_level, device.battery_status)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Device Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              {renderDeviceState(device)}
            </div>

            {/* Battery Level */}
            {device.battery_level && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Battery:</span>
                <span className="text-sm font-medium">{device.battery_level}%</span>
              </div>
            )}

            {/* Last Seen */}
            {device.last_seen_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Seen:</span>
                <span className="text-sm">
                  {format(new Date(device.last_seen_at), 'MMM d, h:mm a')}
                </span>
              </div>
            )}

            {/* Device Controls */}
            {device.is_online && (
              <div className="pt-2 border-t">
                {renderDeviceControls(device)}
              </div>
            )}

            {!device.is_online && (
              <div className="pt-2 border-t">
                <Badge variant="secondary" className="w-full justify-center">
                  Device Offline
                </Badge>
              </div>
            )}

            {/* Detailed Info for detailed view */}
            {detailed && (
              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Device ID:</span>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {device.seam_device_id.slice(-8)}
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{device.device_type.replace('_', ' ')}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};