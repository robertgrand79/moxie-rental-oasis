import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Property } from '@/types/property';
import { Key, Trash2, Plus, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Device {
  id: string;
  device_name: string;
  device_type: string;
  location: string | null;
}

interface AccessCode {
  id: string;
  seam_access_code_id: string;
  code_value: string | null;
  code_name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  usage_count: number;
  property_reservations?: {
    guest_name: string;
    check_in_date: string;
    check_out_date: string;
  };
}

interface AccessCodeManagerProps {
  property: Property;
  devices: Device[];
}

export const AccessCodeManager = ({ property, devices }: AccessCodeManagerProps) => {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [property.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load access codes
      await loadAccessCodes();
      
      // Load upcoming reservations without access codes
      const { data: reservationData, error: reservationError } = await supabase
        .from('property_reservations')
        .select(`
          id,
          guest_name,
          check_in_date,
          check_out_date,
          booking_status
        `)
        .eq('property_id', property.id)
        .eq('booking_status', 'confirmed')
        .gte('check_out_date', new Date().toISOString().split('T')[0])
        .order('check_in_date');

      if (reservationError) throw reservationError;

      // Set available reservations (all confirmed reservations for now)
      const availableReservations = reservationData || [];

      setReservations(availableReservations);

    } catch (error) {
      console.error('Error loading access code data:', error);
      toast({
        title: "Error",
        description: "Failed to load access code data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAccessCodes = async () => {
    const deviceIds = devices.map(d => d.id);
    if (deviceIds.length === 0) return;

    const { data, error } = await supabase
      .from('seam_access_codes')
      .select(`
        *,
        property_reservations(guest_name, check_in_date, check_out_date)
      `)
      .in('device_id', deviceIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAccessCodes(data || []);
  };

  const handleCreateAccessCode = async () => {
    if (!selectedDevice || !selectedReservation) {
      toast({
        title: "Error",
        description: "Please select both a device and reservation",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      const { data, error } = await supabase.functions.invoke('seam-access-codes', {
        body: {
          action: 'create',
          deviceId: selectedDevice,
          reservationId: selectedReservation,
          accessCodeData: {} // Additional code settings can be added here
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Access code created successfully",
      });

      // Reset form and reload data
      setSelectedDevice('');
      setSelectedReservation('');
      await loadData();

    } catch (error) {
      console.error('Error creating access code:', error);
      toast({
        title: "Error",
        description: "Failed to create access code",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAccessCode = async (accessCodeId: string) => {
    if (!confirm('Are you sure you want to delete this access code?')) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('seam-access-codes', {
        body: {
          action: 'delete',
          accessCodeData: { accessCodeId }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Access code deleted successfully",
      });

      await loadData();

    } catch (error) {
      console.error('Error deleting access code:', error);
      toast({
        title: "Error",
        description: "Failed to delete access code",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading access codes...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-8">
        <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Smart Locks Found</h3>
        <p className="text-muted-foreground">
          Connect smart locks to manage guest access codes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Access Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Access Code
          </CardTitle>
          <CardDescription>
            Generate a new access code for a guest reservation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Smart Lock</Label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select a smart lock...</option>
                {devices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.device_name} {device.location && `(${device.location})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Guest Reservation</Label>
              <select
                value={selectedReservation}
                onChange={(e) => setSelectedReservation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select a reservation...</option>
                {reservations.map(reservation => (
                  <option key={reservation.id} value={reservation.id}>
                    {reservation.guest_name} - {format(new Date(reservation.check_in_date), 'MMM d')} to {format(new Date(reservation.check_out_date), 'MMM d')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button 
            onClick={handleCreateAccessCode}
            disabled={creating || !selectedDevice || !selectedReservation}
            className="w-full"
          >
            {creating ? 'Creating...' : 'Create Access Code'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Access Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Active Access Codes ({accessCodes.length})
          </CardTitle>
          <CardDescription>
            Manage existing guest access codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accessCodes.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Access Codes</h3>
              <p className="text-muted-foreground">
                Create access codes for guest reservations to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accessCodes.map((code) => (
                <div key={code.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{code.code_name}</span>
                        <Badge variant="outline">
                          Used {code.usage_count} times
                        </Badge>
                      </div>
                      
                      {code.property_reservations && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(code.starts_at), 'MMM d, yyyy')} - {format(new Date(code.ends_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}

                      {code.code_value && (
                        <div className="font-mono text-lg font-bold bg-muted px-3 py-2 rounded w-fit">
                          {code.code_value}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAccessCode(code.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
