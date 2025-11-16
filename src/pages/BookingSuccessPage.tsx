import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Reservation } from '@/types/booking';

const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [reservation, setReservation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const sessionId = searchParams.get('session_id');
  const reservationId = searchParams.get('reservation_id');

  useEffect(() => {
    const verifyPaymentAndFetchReservation = async () => {
      if (!sessionId || !reservationId) {
        toast({
          title: 'Error',
          description: 'Missing session information. Please contact support.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      try {
        // Verify payment status
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId, reservationId }
        });

        if (paymentError) {
          console.error('Payment verification error:', paymentError);
          throw new Error('Failed to verify payment');
        }

        setPaymentVerified(paymentData.paymentStatus === 'paid');

        // Fetch reservation details
        const { data: reservationData, error: reservationError } = await supabase
          .from('property_reservations')
          .select('*')
          .eq('id', reservationId)
          .single();

        if (reservationError) {
          console.error('Reservation fetch error:', reservationError);
          throw new Error('Failed to fetch reservation details');
        }

        // Fetch property details separately
        const { data: propertyData } = await supabase
          .from('properties')
          .select('title, location, image_url')
          .eq('id', reservationData.property_id)
          .single();

        setReservation({ 
          ...reservationData, 
          property: propertyData 
        } as any);

        if (paymentData.paymentStatus === 'paid') {
          toast({
            title: 'Payment Successful!',
            description: 'Your booking has been confirmed and payment processed.',
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'There was an issue processing your booking. Please contact support.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentAndFetchReservation();
  }, [sessionId, reservationId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Unable to load booking details. Please contact support.</p>
            <Button asChild className="mt-4">
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                {paymentVerified ? 'Booking Confirmed!' : 'Booking Created'}
              </CardTitle>
              <p className="text-muted-foreground">
                {paymentVerified 
                  ? 'Your payment has been processed and your reservation is confirmed.'
                  : 'Your booking has been created. Payment verification in progress.'
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confirmation Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{reservation.property?.title || 'Property'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {new Date(reservation.check_in_date).toLocaleDateString()} - {' '}
                      {new Date(reservation.check_out_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{reservation.guest_count || reservation.total_guests || 1} guest(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>${reservation.total_amount?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Guest Information</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {reservation.guest_name}</p>
                  <p><strong>Email:</strong> {reservation.guest_email}</p>
                  {reservation.guest_phone && (
                    <p><strong>Phone:</strong> {reservation.guest_phone}</p>
                  )}
                  <p><strong>Confirmation Code:</strong> {reservation.confirmation_code}</p>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Payment Status</h3>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    paymentVerified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm">
                    {paymentVerified ? 'Payment Confirmed' : 'Payment Processing'}
                  </span>
                </div>
              </div>

              {/* Special Requests */}
              {reservation.special_requests && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Special Requests</h3>
                  <p className="text-sm text-gray-600">{reservation.special_requests}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button asChild className="flex-1">
                  <Link to="/">Return Home</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/properties">Browse More Properties</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;