import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Check, Clock, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

interface QRCodeCheckinProps {
  reservationId?: string;
  accessCode?: string;
}

interface ReservationDetails {
  id: string;
  check_in_date: string;
  check_out_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_count: number;
  booking_status: string;
  check_in_instructions?: string;
  properties: {
    title: string;
    location: string;
  };
}

const QRCodeCheckin = ({ reservationId, accessCode }: QRCodeCheckinProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tenantId } = useTenant();
  const [manualCode, setManualCode] = useState('');
  const [checkinStatus, setCheckinStatus] = useState<'pending' | 'checking' | 'success' | 'error'>('pending');
  const [currentReservationId, setCurrentReservationId] = useState(reservationId);

  // Fetch support contact info
  const { data: contactSettings } = useQuery({
    queryKey: ['support-contact', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['contactEmail', 'phone']);

      if (tenantId) {
        query = query.eq('organization_id', tenantId);
      }

      const { data } = await query;
      return data?.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {} as Record<string, any>) || {};
    },
    staleTime: 5 * 60 * 1000,
  });

  const supportEmail = contactSettings?.contactEmail || '';
  const supportPhone = contactSettings?.phone || '';

  // Fetch reservation details
  const { data: reservation, isLoading } = useQuery({
    queryKey: ['checkin-reservation', currentReservationId],
    queryFn: async () => {
      if (!currentReservationId) return null;

      const { data, error } = await supabase
        .from('property_reservations')
        .select(`
          *,
          properties:properties!inner(title, location)
        `)
        .eq('id', currentReservationId)
        .single();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        properties: data.properties || { title: 'Property', location: '' }
      } as ReservationDetails;
    },
    enabled: !!currentReservationId,
  });

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: async ({ reservationId, code }: { reservationId: string; code: string }) => {
      const { data: reservation, error } = await supabase
        .from('property_reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

      if (error) throw new Error('Reservation not found');

      const checkInDate = new Date(reservation.check_in_date);
      const now = new Date();
      const earlyCheckinTime = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate(), 12, 0);

      if (now < earlyCheckinTime) {
        throw new Error('Check-in is not available yet. Early check-in starts at 12:00 PM.');
      }

      if (now > new Date(reservation.check_out_date)) {
        throw new Error('This reservation has expired.');
      }

      if (code.length !== 6) {
        throw new Error('Invalid access code. Please check your code and try again.');
      }

      const { error: updateError } = await supabase
        .from('property_reservations')
        .update({ 
          booking_status: 'checked_in',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (updateError) throw updateError;

      return { success: true, message: 'Check-in successful!' };
    },
    onSuccess: () => {
      setCheckinStatus('success');
      toast({
        title: "Check-in Successful!",
        description: "Welcome to your property. Enjoy your stay!",
      });
    },
    onError: (error) => {
      setCheckinStatus('error');
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQRScan = (code: string) => {
    if (!currentReservationId) {
      toast({
        title: "Error",
        description: "No reservation selected",
        variant: "destructive",
      });
      return;
    }

    setCheckinStatus('checking');
    checkinMutation.mutate({ reservationId: currentReservationId, code });
  };

  const handleManualCheckin = () => {
    if (!manualCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter your access code",
        variant: "destructive",
      });
      return;
    }

    handleQRScan(manualCode.trim());
  };

  useEffect(() => {
    if (accessCode && currentReservationId && checkinStatus === 'pending') {
      handleQRScan(accessCode);
    }
  }, [accessCode, currentReservationId]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reservation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkinStatus === 'success') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center p-8">
            <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-2">Check-in Successful!</h2>
            <p className="text-green-700 mb-4">Welcome to {reservation?.properties.title}</p>
            
            {reservation?.check_in_instructions && (
              <Alert className="text-left mt-4 border-green-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> {reservation.check_in_instructions}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 space-y-2">
              <Button className="w-full" onClick={() => window.location.href = '/guest/portal'}>
                Open Guest Portal
              </Button>
              <Button variant="outline" className="w-full">
                View Property Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 space-y-6">
      {/* Reservation Details */}
      {reservation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{reservation.properties.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {reservation.properties.location}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Guest:</span>
              <span className="font-medium">{reservation.guest_name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Check-in:</span>
              <span className="font-medium">{new Date(reservation.check_in_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Check-out:</span>
              <span className="font-medium">{new Date(reservation.check_out_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Guests:</span>
              <span className="font-medium">{reservation.guest_count}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={reservation.booking_status === 'confirmed' ? 'default' : 'secondary'}>
                {reservation.booking_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Check-in */}
      <Card>
        <CardHeader className="text-center">
          <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Property Check-in</CardTitle>
          <CardDescription>
            Scan your QR code or enter your access code to check in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Scanner Placeholder */}
          <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">QR Scanner</p>
              <p className="text-xs text-muted-foreground">Point camera at QR code</p>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            or
          </div>

          {/* Manual Code Entry */}
          <div className="space-y-3">
            <Input
              placeholder="Enter 6-digit access code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <Button 
              className="w-full" 
              onClick={handleManualCheckin}
              disabled={checkinMutation.isPending || checkinStatus === 'checking'}
            >
              {checkinMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Checking In...
                </>
              ) : (
                'Check In'
              )}
            </Button>
          </div>

          {checkinStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Check-in failed. Please verify your access code or contact support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {supportPhone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${supportPhone}`}>
                  <Phone className="h-4 w-4 mr-1" />
                  Call Support
                </a>
              </Button>
            )}
            {supportEmail && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${supportEmail}`}>
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </a>
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Check-in is available from 12:00 PM. Standard check-in time is 3:00 PM.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeCheckin;
