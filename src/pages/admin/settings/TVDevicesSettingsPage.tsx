import React, { useState } from 'react';
import { Tv, Monitor, MonitorOff, Plus, Unplug, Loader2, Wifi, WifiOff } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminOrganizationId } from '@/hooks/useAdminOrganizationId';
import { useTVDeviceAdmin, TVDeviceAdmin } from '@/hooks/useTVDeviceAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const TVDevicesSettingsPage = () => {
  const { organizationId } = useAdminOrganizationId();
  const { devices, deviceCounts, isLoading, refetch, isDeviceOnline } = useTVDeviceAdmin(organizationId ?? undefined);

  const [pairOpen, setPairOpen] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [pairing, setPairing] = useState(false);
  const [unpairingId, setUnpairingId] = useState<string | null>(null);

  // Fetch properties for the pair modal
  const { data: properties } = useQuery({
    queryKey: ['org-properties-tv', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .eq('organization_id', organizationId)
        .order('title');
      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
  });

  const handleUnpair = async (device: TVDeviceAdmin) => {
    setUnpairingId(device.id);
    try {
      const { error } = await supabase.functions.invoke('tv-device-unpair', {
        body: { device_id: device.device_id },
      });
      if (error) throw error;
      toast({ title: 'Device unpaired', description: `${device.device_name || 'TV Device'} has been unpaired.` });
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to unpair device', variant: 'destructive' });
    } finally {
      setUnpairingId(null);
    }
  };

  const handlePairDevice = async () => {
    if (!pairingCode || !selectedPropertyId) return;
    setPairing(true);
    try {
      // Validate pairing code to mark device as paired
      const { data, error } = await supabase.functions.invoke('tv-pairing-validate', {
        body: { pairing_code: pairingCode, email: 'host-paired' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Update device name if provided
      if (deviceName && data?.device_id) {
        await supabase
          .from('tv_device_pairings')
          .update({ device_name: deviceName, property_id: selectedPropertyId })
          .eq('id', data.device_id);
      }

      toast({ title: 'TV Paired', description: `${deviceName || 'TV Device'} has been paired successfully.` });
      setPairOpen(false);
      setPairingCode('');
      setDeviceName('');
      setSelectedPropertyId('');
      refetch();
    } catch (err: any) {
      toast({ title: 'Pairing Failed', description: err.message || 'Invalid or expired pairing code', variant: 'destructive' });
    } finally {
      setPairing(false);
    }
  };

  const offlineCount = deviceCounts.total - deviceCounts.online;

  return (
    <SettingsSidebarLayout
      title="TV Devices"
      description="Manage TV devices and guest portal displays"
      icon={Tv}
      headerActions={
        <Dialog open={pairOpen} onOpenChange={setPairOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Pair New TV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pair a New TV</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code displayed on the TV screen to pair it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Pairing Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. 482719"
                  maxLength={6}
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-xl tracking-widest font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Device Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Living Room TV"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPairOpen(false)}>Cancel</Button>
              <Button
                onClick={handlePairDevice}
                disabled={pairing || pairingCode.length !== 6 || !selectedPropertyId}
              >
                {pairing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Pair Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{deviceCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Wifi className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{deviceCounts.online}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <WifiOff className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-destructive">{offlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !devices?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <MonitorOff className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No TV devices registered</p>
              <p className="text-sm mt-1">Pair a TV to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Display Mode</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => {
                  const online = isDeviceOnline(device);
                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        {device.device_name || 'Unnamed Device'}
                      </TableCell>
                      <TableCell>{device.property?.title || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={online ? 'default' : 'secondary'} className={online ? 'bg-green-600 hover:bg-green-700' : ''}>
                          {online ? 'Online' : 'Offline'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{device.display_mode?.replace('_', ' ') || '—'}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {device.last_seen_at
                          ? formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        {device.is_paired && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnpair(device)}
                            disabled={unpairingId === device.id}
                          >
                            {unpairingId === device.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Unplug className="h-4 w-4 mr-1" />
                            )}
                            Unpair
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </SettingsSidebarLayout>
  );
};

export default TVDevicesSettingsPage;
