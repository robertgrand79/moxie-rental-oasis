import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Property } from '@/types/property';
import { Settings, Plus, Clock, LogIn, LogOut, Thermometer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Device {
  id: string;
  device_name: string;
  device_type: string;
  location: string | null;
}

interface TriggerConditions {
  event?: string;
  timing?: string;
}

interface AutomationActions {
  lock_action?: string;
  notification?: string;
  access_code_action?: string;
  thermostat_action?: string;
  temperature?: number;
  mode?: string;
}

interface DeviceAutomation {
  id: string;
  automation_name: string;
  automation_type: string;
  trigger_conditions: TriggerConditions;
  target_devices: string[];
  actions: AutomationActions;
  is_active: boolean;
}

interface DeviceAutomationsProps {
  property: Property;
  devices: Device[];
}

export const DeviceAutomations = ({ property, devices }: DeviceAutomationsProps) => {
  const [automations, setAutomations] = useState<DeviceAutomation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomations();
  }, [property.id]);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('device_automations')
        .select('*')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations((data || []) as DeviceAutomation[]);

    } catch (error) {
      console.error('Error loading automations:', error);
      toast({
        title: "Error",
        description: "Failed to load automations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('device_automations')
        .update({ is_active: isActive })
        .eq('id', automationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Automation ${isActive ? 'enabled' : 'disabled'}`,
      });

      await loadAutomations();

    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: "Error",
        description: "Failed to update automation",
        variant: "destructive",
      });
    }
  };

  const createDefaultAutomations = async () => {
    try {
      const smartLocks = devices.filter(d => d.device_type === 'smart_lock');
      const thermostats = devices.filter(d => d.device_type === 'thermostat');

      const defaultAutomations = [];

      // Check-in automation for locks
      if (smartLocks.length > 0) {
        defaultAutomations.push({
          property_id: property.id,
          automation_name: 'Guest Check-in: Unlock Doors',
          automation_type: 'checkin',
          trigger_conditions: {
            event: 'reservation_checkin',
            timing: 'on_checkin_time'
          },
          target_devices: smartLocks.map(d => d.id),
          actions: {
            lock_action: 'unlock',
            notification: 'send_access_code'
          },
          is_active: true
        });
      }

      // Check-out automation for locks
      if (smartLocks.length > 0) {
        defaultAutomations.push({
          property_id: property.id,
          automation_name: 'Guest Check-out: Lock Doors',
          automation_type: 'checkout',
          trigger_conditions: {
            event: 'reservation_checkout',
            timing: 'on_checkout_time'
          },
          target_devices: smartLocks.map(d => d.id),
          actions: {
            lock_action: 'lock',
            access_code_action: 'disable'
          },
          is_active: true
        });
      }

      // Thermostat automation for check-in
      if (thermostats.length > 0) {
        defaultAutomations.push({
          property_id: property.id,
          automation_name: 'Guest Arrival: Comfort Temperature',
          automation_type: 'checkin',
          trigger_conditions: {
            event: 'reservation_checkin',
            timing: '1_hour_before'
          },
          target_devices: thermostats.map(d => d.id),
          actions: {
            thermostat_action: 'set_temperature',
            temperature: 72,
            mode: 'auto'
          },
          is_active: true
        });
      }

      // Thermostat automation for check-out
      if (thermostats.length > 0) {
        defaultAutomations.push({
          property_id: property.id,
          automation_name: 'Guest Departure: Energy Saving',
          automation_type: 'checkout',
          trigger_conditions: {
            event: 'reservation_checkout',
            timing: 'on_checkout_time'
          },
          target_devices: thermostats.map(d => d.id),
          actions: {
            thermostat_action: 'set_temperature',
            temperature: 65,
            mode: 'heat'
          },
          is_active: true
        });
      }

      if (defaultAutomations.length > 0) {
        const { error } = await supabase
          .from('device_automations')
          .insert(defaultAutomations);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Created ${defaultAutomations.length} default automations`,
        });

        await loadAutomations();
      }

    } catch (error) {
      console.error('Error creating default automations:', error);
      toast({
        title: "Error",
        description: "Failed to create default automations",
        variant: "destructive",
      });
    }
  };

  const getAutomationIcon = (type: string) => {
    switch (type) {
      case 'checkin':
        return <LogIn className="h-5 w-5 text-green-500" />;
      case 'checkout':
        return <LogOut className="h-5 w-5 text-red-500" />;
      case 'schedule':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionDescription = (automation: DeviceAutomation) => {
    const actions = automation.actions;
    const devices = automation.target_devices;
    
    let description = '';
    
    if (actions.lock_action) {
      description += `${actions.lock_action} ${devices.length} device(s)`;
    }
    
    if (actions.thermostat_action && actions.temperature) {
      if (description) description += ', ';
      description += `set temperature to ${actions.temperature}°F`;
    }
    
    if (actions.access_code_action) {
      if (description) description += ', ';
      description += `${actions.access_code_action} access codes`;
    }

    return description || 'Custom actions';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading automations...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Device Automations
          </CardTitle>
          <CardDescription>
            Automate your smart devices based on guest check-ins, check-outs, and schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Devices Available</h3>
              <p className="text-muted-foreground">
                Connect smart devices to create automations.
              </p>
            </div>
          ) : automations.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Automations Configured</h3>
              <p className="text-muted-foreground mb-4">
                Create automations to manage your smart devices automatically.
              </p>
              <Button onClick={createDefaultAutomations}>
                <Plus className="h-4 w-4 mr-2" />
                Create Default Automations
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">{automations.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total Automations
                </div>
              </div>
              <Button variant="outline" onClick={createDefaultAutomations}>
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation List */}
      {automations.length > 0 && (
        <div className="grid gap-4">
          {automations.map((automation) => (
            <Card key={automation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAutomationIcon(automation.automation_type)}
                    <div>
                      <CardTitle className="text-base">{automation.automation_name}</CardTitle>
                      <CardDescription>
                        {getActionDescription(automation)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={automation.is_active ? "default" : "secondary"}>
                      {automation.is_active ? "Active" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={automation.is_active}
                      onCheckedChange={(checked) => handleToggleAutomation(automation.id, checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Trigger</Label>
                    <div className="capitalize">
                      {automation.automation_type.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Target Devices</Label>
                    <div>{automation.target_devices.length} device(s)</div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Timing</Label>
                    <div className="capitalize">
                      {automation.trigger_conditions?.timing?.replace('_', ' ') || 'Immediate'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Device Summary */}
      {devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Devices ({devices.length})</CardTitle>
            <CardDescription>
              Devices that can be used in automations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {device.device_type === 'smart_lock' ? (
                    <Settings className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Thermometer className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">{device.device_name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {device.device_type.replace('_', ' ')}
                      {device.location && ` • ${device.location}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};