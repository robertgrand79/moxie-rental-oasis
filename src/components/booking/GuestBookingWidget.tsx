import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/property';
import { useAvailability, useDynamicPricing, useCreateReservation } from '@/hooks/useBookingData';
import { Calendar, Users, DollarSign, Shield, Clock, CheckCircle } from 'lucide-react';
import { BookingCalendar } from './BookingCalendar';
import { format, differenceInDays, addDays, isBefore } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GuestBookingWidgetProps {
  property: Property;
  onBookingComplete?: (reservationId: string) => void;
}

interface BookingForm {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCount: number;
  specialRequests: string;
}

const GuestBookingWidget = ({ property, onBookingComplete }: GuestBookingWidgetProps) => {
  const [selectedDates, setSelectedDates] = useState<{ start: string; end: string } | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestCount: 1,
    specialRequests: ''
  });
  const [step, setStep] = useState<'dates' | 'details' | 'review' | 'complete'>('dates');

  const { toast } = useToast();
  const { mutate: createReservation, isPending: isBooking } = useCreateReservation();
  const { data: pricing } = useDynamicPricing(
    property.id,
    selectedDates ? { start: selectedDates.start, end: selectedDates.end } : undefined
  );

  const calculateTotalPrice = () => {
    if (!selectedDates || !pricing) return 0;
    
    const days = differenceInDays(new Date(selectedDates.end), new Date(selectedDates.start));
    const totalPrice = pricing.reduce((sum, dayPricing) => sum + dayPricing.final_price, 0);
    return totalPrice || (days * (property.price_per_night || 0));
  };

  const handleDateSelect = (dates: { start: string; end: string }) => {
    setSelectedDates(dates);
    setStep('details');
  };

  const handleFormChange = (field: keyof BookingForm, value: string | number) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const handleReviewBooking = () => {
    if (!bookingForm.guestName || !bookingForm.guestEmail || !selectedDates) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setStep('review');
  };

  const handleConfirmBooking = async () => {
    if (!selectedDates || !property) return;
    
    try {
      const totalAmount = calculateTotalPrice();
      
      // First create the reservation
      const reservationData = {
        property_id: property.id,
        guest_name: bookingForm.guestName,
        guest_email: bookingForm.guestEmail,
        guest_phone: bookingForm.guestPhone,
        check_in_date: selectedDates.start,
        check_out_date: selectedDates.end,
        guest_count: bookingForm.guestCount,
        total_amount: totalAmount,
        booking_status: 'pending' as const,
        payment_status: 'pending' as const,
        special_requests: bookingForm.specialRequests,
        confirmation_code: Math.random().toString(36).substring(2, 15),
        created_by: 'guest'
      };

      // Use the mutation to create reservation with Promise
      const reservation = await new Promise((resolve, reject) => {
        createReservation(reservationData, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error)
        });
      });

      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          reservationId: (reservation as any).id,
          guestEmail: bookingForm.guestEmail,
          totalAmount: totalAmount,
          propertyTitle: property.title,
          checkInDate: selectedDates.start,
          checkOutDate: selectedDates.end
        }
      });

      if (checkoutError) {
        console.error('Checkout error:', checkoutError);
        throw new Error('Failed to create payment session');
      }

      // Redirect to Stripe Checkout
      if (checkoutData?.url) {
        window.open(checkoutData.url, '_blank');
        setStep('complete');
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout in a new tab...",
        });
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking Error',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderDateSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Your Dates</h3>
        <p className="text-muted-foreground">Choose your check-in and check-out dates</p>
      </div>
      
      <BookingCalendar
        propertyId={property.id}
        onDateSelect={handleDateSelect}
        selectedDates={selectedDates}
      />

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Free Cancellation</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Instant Confirmation</span>
        </div>
      </div>
    </div>
  );

  const renderGuestDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Guest Information</h3>
        <p className="text-muted-foreground">Please provide your details for the booking</p>
      </div>

      {selectedDates && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {format(new Date(selectedDates.start), 'MMM d, yyyy')} - {format(new Date(selectedDates.end), 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {differenceInDays(new Date(selectedDates.end), new Date(selectedDates.start))} nights
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${calculateTotalPrice()}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guestName">Full Name *</Label>
            <Input
              id="guestName"
              value={bookingForm.guestName}
              onChange={(e) => handleFormChange('guestName', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="guestCount">Number of Guests</Label>
            <Input
              id="guestCount"
              type="number"
              min="1"
              max={property.max_guests}
              value={bookingForm.guestCount}
              onChange={(e) => handleFormChange('guestCount', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="guestEmail">Email Address *</Label>
          <Input
            id="guestEmail"
            type="email"
            value={bookingForm.guestEmail}
            onChange={(e) => handleFormChange('guestEmail', e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <Label htmlFor="guestPhone">Phone Number</Label>
          <Input
            id="guestPhone"
            type="tel"
            value={bookingForm.guestPhone}
            onChange={(e) => handleFormChange('guestPhone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="specialRequests">Special Requests</Label>
          <Textarea
            id="specialRequests"
            value={bookingForm.specialRequests}
            onChange={(e) => handleFormChange('specialRequests', e.target.value)}
            placeholder="Any special requests or requirements..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('dates')} className="flex-1">
          Back to Dates
        </Button>
        <Button onClick={handleReviewBooking} className="flex-1">
          Review Booking
        </Button>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review Your Booking</h3>
        <p className="text-muted-foreground">Please review your booking details before confirming</p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Property Details</h4>
          <p className="font-semibold">{property.title}</p>
          <p className="text-sm text-muted-foreground">{property.location}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Booking Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Check-in</p>
              <p className="font-medium">{selectedDates && format(new Date(selectedDates.start), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Check-out</p>
              <p className="font-medium">{selectedDates && format(new Date(selectedDates.end), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Guests</p>
              <p className="font-medium">{bookingForm.guestCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nights</p>
              <p className="font-medium">{selectedDates && differenceInDays(new Date(selectedDates.end), new Date(selectedDates.start))}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Guest Information</h4>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {bookingForm.guestName}</p>
            <p><span className="text-muted-foreground">Email:</span> {bookingForm.guestEmail}</p>
            {bookingForm.guestPhone && (
              <p><span className="text-muted-foreground">Phone:</span> {bookingForm.guestPhone}</p>
            )}
            {bookingForm.specialRequests && (
              <p><span className="text-muted-foreground">Special Requests:</span> {bookingForm.specialRequests}</p>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-muted">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Amount</span>
            <span className="text-2xl font-bold">${calculateTotalPrice()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
          Back to Details  
        </Button>
        <Button onClick={handleConfirmBooking} disabled={isBooking} className="flex-1">
          {isBooking ? 'Processing...' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Booking Submitted!</h3>
        <p className="text-muted-foreground">
          Thank you for your booking request. We'll review it and send you a confirmation email shortly.
        </p>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
        <p className="font-mono font-semibold">BK{Date.now().toString().slice(-6)}</p>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>What happens next:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>We'll review your booking within 24 hours</li>
          <li>You'll receive a confirmation email</li>
          <li>Check-in instructions will be sent 24 hours before arrival</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {step === 'complete' ? 'Booking Confirmed' : 'Book Your Stay'}
        </CardTitle>
        <CardDescription>
          {step === 'complete' ? 'Your booking has been successfully submitted' : `Reserve ${property.title}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        {step !== 'complete' && (
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              ['dates', 'details', 'review'].includes(step) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`h-1 w-8 ${step !== 'dates' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              ['details', 'review'].includes(step) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div className={`h-1 w-8 ${step === 'review' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
          </div>
        )}

        {/* Step content */}
        {step === 'dates' && renderDateSelection()}
        {step === 'details' && renderGuestDetails()}
        {step === 'review' && renderReview()}
        {step === 'complete' && renderComplete()}
      </CardContent>
    </Card>
  );
};

export default GuestBookingWidget;