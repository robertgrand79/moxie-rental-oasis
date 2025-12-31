import React, { useState, useEffect } from 'react';
import { Tv, Plus, Trash2, RefreshCw, QrCode, Eye, Settings2, MonitorPlay, Users, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface TVDevice {
  id: string;
  property_id: string;
  device_id: string;
  device_name: string;
  pairing_code: string | null;
  pairing_code_expires_at: string | null;
  is_paired: boolean;
  paired_at: string | null;
  last_seen_at: string | null;
  display_mode: 'welcome' | 'guest_portal' | 'signage';
  guest_email: string | null;
  current_reservation_id: string | null;
}

interface Property {
  id: string;
  name: string;
  address: string;
}

const TVDevicesSettingsTab = () => {
  const { organization } = useCurrentOrganization();
  const [devices, setDevices] = useState<TVDevice[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [newDeviceName, setNewDeviceName] = useState('Living Room TV');
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (organization?.id) {
      fetchData();
    }
  }, [organization?.id]);

  const fetchData = async () => {
    if (!organization?.id) return;
    setIsLoading(true);
    
    try {
      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, location')
        .eq('organization_id', organization.id)
        .order('title');
      
      if (propertiesError) throw propertiesError;
      setProperties((propertiesData || []).map(p => ({ id: p.id, name: p.title, address: p.location || '' })));

      // Fetch TV devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('tv_device_pairings')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
      
      if (devicesError) throw devicesError;
      setDevices((devicesData || []) as TVDevice[]);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load TV devices',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePairingCode = () => {
    return Math.random().toString().slice(2, 8);
  };

  const addDevice = async () => {
    if (!organization?.id || !selectedProperty) return;
    
    setIsAddingDevice(true);
    try {
      const deviceId = `tv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const pairingCode = generatePairingCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      const { error } = await supabase
        .from('tv_device_pairings')
        .insert({
          organization_id: organization.id,
          property_id: selectedProperty,
          device_id: deviceId,
          device_name: newDeviceName,
          pairing_code: pairingCode,
          pairing_code_expires_at: expiresAt,
          display_mode: 'welcome'
        });

      if (error) throw error;

      toast({
        title: 'Device added',
        description: `Pairing code: ${pairingCode}. Valid for 5 minutes.`
      });

      setNewDeviceName('Living Room TV');
      setSelectedProperty('');
      fetchData();
    } catch (error: any) {
      console.error('Error adding device:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add device',
        variant: 'destructive'
      });
    } finally {
      setIsAddingDevice(false);
    }
  };

  const updateDevice = async (deviceId: string, updates: Partial<TVDevice>) => {
    try {
      const { error } = await supabase
        .from('tv_device_pairings')
        .update(updates)
        .eq('id', deviceId);

      if (error) throw error;

      toast({ title: 'Device updated' });
      fetchData();
    } catch (error: any) {
      console.error('Error updating device:', error);
      toast({
        title: 'Error',
        description: 'Failed to update device',
        variant: 'destructive'
      });
    }
  };

  const regeneratePairingCode = async (deviceId: string) => {
    const pairingCode = generatePairingCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await updateDevice(deviceId, {
      pairing_code: pairingCode,
      pairing_code_expires_at: expiresAt,
      is_paired: false,
      guest_email: null,
      current_reservation_id: null
    });
  };

  const unpairDevice = async (deviceId: string) => {
    await updateDevice(deviceId, {
      is_paired: false,
      guest_email: null,
      current_reservation_id: null,
      display_mode: 'welcome'
    });
  };

  const deleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('tv_device_pairings')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      toast({ title: 'Device removed' });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove device',
        variant: 'destructive'
      });
    }
  };

  const copyPairingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDevicesByProperty = (propertyId: string) => {
    return devices.filter(d => d.property_id === propertyId);
  };

  const getDisplayModeIcon = (mode: string) => {
    switch (mode) {
      case 'guest_portal': return <Users className="h-4 w-4" />;
      case 'signage': return <MonitorPlay className="h-4 w-4" />;
      default: return <Tv className="h-4 w-4" />;
    }
  };

  const getDisplayModeLabel = (mode: string) => {
    switch (mode) {
      case 'guest_portal': return 'Guest Portal';
      case 'signage': return 'Digital Signage';
      default: return 'Welcome Screen';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Device */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Register New TV Device
          </CardTitle>
          <CardDescription>
            Add a new TV to display the guest portal at a property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Device Name</Label>
              <Input
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g., Living Room TV"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addDevice} 
                disabled={!selectedProperty || !newDeviceName || isAddingDevice}
                className="w-full"
              >
                {isAddingDevice ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Device
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices by Property */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tv className="h-5 w-5" />
            Registered TV Devices
          </CardTitle>
          <CardDescription>
            Manage TV devices and their display settings by property
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No properties found. Add a property first to register TV devices.
            </p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {properties.map(property => {
                const propertyDevices = getDevicesByProperty(property.id);
                return (
                  <AccordionItem key={property.id} value={property.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{property.name}</span>
                        <Badge variant="secondary">
                          {propertyDevices.length} device{propertyDevices.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {propertyDevices.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4 text-center">
                          No TV devices registered for this property
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {propertyDevices.map(device => (
                            <div 
                              key={device.id} 
                              className="border rounded-lg p-4 space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${device.is_paired ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                    <Tv className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{device.device_name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {device.is_paired ? (
                                        <>Paired • {device.guest_email}</>
                                      ) : (
                                        <>Awaiting pairing</>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={device.is_paired ? 'default' : 'secondary'}>
                                    {device.is_paired ? 'Paired' : 'Unpaired'}
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {getDisplayModeIcon(device.display_mode)}
                                    {getDisplayModeLabel(device.display_mode)}
                                  </Badge>
                                </div>
                              </div>

                              {/* Pairing Code */}
                              {!device.is_paired && device.pairing_code && (
                                <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Pairing Code</p>
                                    <p className="text-2xl font-mono font-bold tracking-widest">
                                      {device.pairing_code}
                                    </p>
                                    {device.pairing_code_expires_at && (
                                      <p className="text-xs text-muted-foreground">
                                        Expires {formatDistanceToNow(new Date(device.pairing_code_expires_at), { addSuffix: true })}
                                      </p>
                                    )}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => copyPairingCode(device.pairing_code!)}
                                  >
                                    {copiedCode === device.pairing_code ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              )}

                              {/* Device Settings */}
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Device Name</Label>
                                  <Input
                                    value={device.device_name}
                                    onChange={(e) => updateDevice(device.id, { device_name: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Display Mode</Label>
                                  <Select 
                                    value={device.display_mode} 
                                    onValueChange={(value) => updateDevice(device.id, { display_mode: value as TVDevice['display_mode'] })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="welcome">Welcome Screen</SelectItem>
                                      <SelectItem value="guest_portal">Guest Portal</SelectItem>
                                      <SelectItem value="signage">Digital Signage</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Last Seen */}
                              {device.last_seen_at && (
                                <p className="text-xs text-muted-foreground">
                                  Last seen: {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
                                </p>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2 pt-2 border-t">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => regeneratePairingCode(device.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  New Code
                                </Button>
                                {device.is_paired && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => unpairDevice(device.id)}
                                  >
                                    Unpair
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove TV Device?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will unregister "{device.device_name}" from this property.
                                        The device will need to be re-paired to use the guest portal.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteDevice(device.id)}>
                                        Remove Device
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Global TV Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Global TV Settings
          </CardTitle>
          <CardDescription>
            Default settings for all TV devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-unpair after checkout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically reset TV to welcome screen when guest checks out
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Show AI Assistant on TV</Label>
              <p className="text-sm text-muted-foreground">
                Enable the AI chat feature on the TV guest portal
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TVDevicesSettingsTab;
