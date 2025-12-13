import React, { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCreateReservation } from '@/hooks/useBookingData';
import { format, differenceInDays, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { BookingProgressBar } from './BookingProgressBar';
import { BookingSummaryCard } from './BookingSummaryCard';
import { DateSelectionStep } from './DateSelectionStep';
import { GuestDetailsStep } from './GuestDetailsStep';
import { ReviewStep } from './ReviewStep';
import { useBookingCharges } from '@/hooks/useBookingCharges';
import { CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GuestBookingWidgetProps {
  property: Property;
  onBookingComplete?: (reservationId: string) => void;
  initialCheckin?: string | null;
  initialCheckout?: string | null;
}

interface BookingForm {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCount: number;
  specialRequests: string;
}

const GuestBookingWidget: React.FC<GuestBookingWidgetProps> = ({ property, onBookingComplete, initialCheckin, initialCheckout }) => {
  // Initialize step and dateRange based on whether initial dates are provided
  const [step, setStep] = useState<1 | 2 | 3 | 4>(() => {
    return (initialCheckin && initialCheckout) ? 2 : 1;
  });
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(() => {
    if (initialCheckin && initialCheckout) {
      return {
        from: parseISO(initialCheckin),
        to: parseISO(initialCheckout)
      };
    }
    return { from: undefined, to: undefined };
  });
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestCount: 1,
    specialRequests: ''
  });
  const [dateRangeValid, setDateRangeValid] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStage, setPaymentStage] = useState<'idle' | 'creating' | 'redirecting' | 'blocked'>('idle');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  
  const { toast } = useToast();
  const createReservationMutation = useCreateReservation();
  
  const selectedDates = dateRange.from && dateRange.to ? {
    start: format(dateRange.from, 'yyyy-MM-dd'),
    end: format(dateRange.to, 'yyyy-MM-dd')
  } : null;

  const { data: charges, isLoading: chargesLoading } = useBookingCharges(
    property.id,
    selectedDates?.start || '',
    selectedDates?.end || '',
    !!selectedDates
  );

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const handleFormChange = (field: keyof BookingForm, value: string | number) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedDates) {
      toast({
        title: "Select Dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2) {
      if (!bookingForm.guestName || !bookingForm.guestEmail) {
        toast({
          title: "Required Fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  const steps = [
    { label: 'Dates' },
    { label: 'Guest Info' },
    { label: 'Review & Pay' }
  ];

  const handleConfirmBooking = async () => {
    if (!selectedDates || !charges) return;

    setIsProcessingPayment(true);
    setPaymentStage('creating');

    try {
      const reservationData = {
        property_id: property.id,
        guest_name: bookingForm.guestName,
        guest_email: bookingForm.guestEmail,
        guest_phone: bookingForm.guestPhone,
        check_in_date: selectedDates.start,
        check_out_date: selectedDates.end,
        guest_count: bookingForm.guestCount,
        total_amount: charges.grandTotal,
        booking_status: 'pending' as const,
        payment_status: 'pending' as const,
        special_requests: bookingForm.specialRequests,
        source_platform: 'direct'
      };

      const reservation = await createReservationMutation.mutateAsync(reservationData);
      
      setPaymentStage('redirecting');

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          reservationId: reservation.id,
          propertyId: property.id,
          guestEmail: bookingForm.guestEmail,
          totalAmount: charges.grandTotal,
          propertyTitle: property.title,
          checkInDate: selectedDates.start,
          checkOutDate: selectedDates.end
        }
      });

      console.log('[CHECKOUT] Response received:', checkoutData);

      if (checkoutError) {
        console.error('[CHECKOUT] Error:', checkoutError);
        throw new Error(checkoutError.message || 'Failed to create checkout session');
      }

      if (checkoutData?.url) {
        console.log('[CHECKOUT] Redirecting to Stripe:', checkoutData.url);
        setCheckoutUrl(checkoutData.url);
        
        // Try redirect - this may be blocked in iframes or by popup blockers
        try {
          window.location.href = checkoutData.url;
        } catch (e) {
          console.log('[CHECKOUT] Direct redirect failed, showing fallback button');
        }
        
        // After 2.5 seconds, if we're still here, show the fallback button
        setTimeout(() => {
          setPaymentStage('blocked');
        }, 2500);
        
        return;
      } else {
        console.error('[CHECKOUT] No URL in response:', checkoutData);
        throw new Error('No checkout URL received from payment provider');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      setIsProcessingPayment(false);
      setPaymentStage('idle');
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getButtonText = () => {
    if (paymentStage === 'creating') return 'Creating reservation...';
    if (paymentStage === 'redirecting') return 'Redirecting to payment...';
    if (paymentStage === 'blocked') return 'Continue to Payment';
    return 'Confirm & Pay';
  };

  // Fallback UI when redirect is blocked
  const renderPaymentFallback = () => (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Reservation Created!</h3>
            <p className="text-sm text-muted-foreground">Click below to complete your payment</p>
          </div>
        </div>
        <a 
          href={checkoutUrl!} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 rounded-md font-medium transition-colors"
        >
          Continue to Payment
          <ExternalLink className="w-4 h-4" />
        </a>
        <p className="text-xs text-muted-foreground text-center">
          You'll be redirected to Stripe to complete your secure payment
        </p>
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6 py-12 max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Booking Confirmed!</h2>
        <p className="text-lg text-muted-foreground">
          A confirmation email has been sent to {bookingForm.guestEmail}
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
        <h3 className="font-semibold">What's Next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
            <span>Check your email for booking details and payment confirmation</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
            <span>You'll receive check-in instructions 24 hours before arrival</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
            <span>Contact us anytime if you have questions</span>
          </li>
        </ul>
      </div>
    </div>
  );

  if (step === 4) {
    return (
      <div className="w-full">
        {renderComplete()}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-background">
        <BookingProgressBar currentStep={step} steps={steps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {step === 1 && (
            <DateSelectionStep
              propertyId={property.id}
              selectedDates={dateRange}
              onDateSelect={handleDateSelect}
              onValidationChange={setDateRangeValid}
            />
          )}
          
          {step === 2 && (
            <GuestDetailsStep
              formData={bookingForm}
              onFormChange={handleFormChange}
              maxGuests={property.max_guests || 10}
            />
          )}
          
          {step === 3 && selectedDates && charges && (
            <ReviewStep
              property={property}
              checkInDate={selectedDates.start}
              checkOutDate={selectedDates.end}
              formData={bookingForm}
              charges={{
                accommodationSubtotal: charges.accommodationSubtotal,
                cleaningFee: charges.cleaningFee,
                serviceFee: charges.serviceFee,
                subtotal: charges.accommodationSubtotal + charges.cleaningFee + charges.serviceFee,
                totalTax: charges.totalTax,
                grandTotal: charges.grandTotal
              }}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                size="lg"
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={handleNextStep}
                size="lg"
                className="flex-1"
                disabled={step === 1 && (!selectedDates || !dateRangeValid)}
              >
                Continue
              </Button>
            )}
            {step === 3 && paymentStage !== 'blocked' && (
              <Button
                onClick={handleConfirmBooking}
                size="lg"
                className="flex-1"
                disabled={isProcessingPayment || !charges}
              >
                {isProcessingPayment && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {getButtonText()}
              </Button>
            )}
            {step === 3 && paymentStage === 'blocked' && checkoutUrl && renderPaymentFallback()}
          </div>
        </div>

        {/* Sticky Summary Card */}
        <div className="lg:col-span-1">
          <BookingSummaryCard
            property={property}
            checkInDate={selectedDates?.start}
            checkOutDate={selectedDates?.end}
            guestCount={bookingForm.guestCount}
            charges={charges ? {
              accommodationSubtotal: charges.accommodationSubtotal,
              cleaningFee: charges.cleaningFee,
              serviceFee: charges.serviceFee,
              subtotal: charges.accommodationSubtotal + charges.cleaningFee + charges.serviceFee,
              totalTax: charges.totalTax,
              grandTotal: charges.grandTotal
            } : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestBookingWidget;
