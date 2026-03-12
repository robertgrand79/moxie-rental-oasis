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
import { PromoCodeInput, AppliedPromo } from './PromoCodeInput';
import { useBookingCharges } from '@/hooks/useBookingCharges';
import { usePromoCode } from '@/hooks/usePromoCode';
import { CheckCircle, Loader2, ExternalLink, Lock, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
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
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  
  const { toast } = useToast();
  const createReservationMutation = useCreateReservation();

  const { recordPromoUsage } = usePromoCode({
    propertyId: property.id,
    organizationId: property.organization_id
  });
  
  const selectedDates = dateRange.from && dateRange.to ? {
    start: format(dateRange.from, 'yyyy-MM-dd'),
    end: format(dateRange.to, 'yyyy-MM-dd')
  } : null;

  const nights = selectedDates 
    ? differenceInDays(parseISO(selectedDates.end), parseISO(selectedDates.start))
    : 0;

  const { data: charges, isLoading: chargesLoading, refetch: refetchCharges } = useBookingCharges(
    property.id,
    selectedDates?.start || '',
    selectedDates?.end || '',
    !!selectedDates,
    bookingForm.guestCount,
    appliedPromo?.code
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
      toast({ title: "Select Dates", description: "Please select check-in and check-out dates", variant: "destructive" });
      return;
    }
    
    if (step === 2) {
      if (!bookingForm.guestName.trim()) {
        toast({ title: "Name Required", description: "Please enter your full name", variant: "destructive" });
        return;
      }
      if (!bookingForm.guestEmail.trim()) {
        toast({ title: "Email Required", description: "Please enter your email address", variant: "destructive" });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingForm.guestEmail)) {
        toast({ title: "Invalid Email", description: "Please enter a valid email address", variant: "destructive" });
        return;
      }
      if (bookingForm.guestCount > (property.max_guests || 10)) {
        toast({ title: "Too Many Guests", description: `This property allows a maximum of ${property.max_guests || 10} guests`, variant: "destructive" });
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
      
      if (appliedPromo) {
        await recordPromoUsage(
          reservation.id,
          bookingForm.guestEmail,
          appliedPromo.calculatedDiscount,
          charges.grandTotal + appliedPromo.calculatedDiscount
        );
      }
      
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

      if (checkoutError) throw new Error(checkoutError.message || 'Failed to create checkout session');

      if (checkoutData?.url) {
        setCheckoutUrl(checkoutData.url);
        try { window.location.href = checkoutData.url; } catch (e) {}
        setTimeout(() => { setPaymentStage('blocked'); }, 2500);
        return;
      } else {
        throw new Error('No checkout URL received from payment provider');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      setIsProcessingPayment(false);
      setPaymentStage('idle');
      toast({ title: "Booking Failed", description: error.message || "Failed to create booking. Please try again.", variant: "destructive" });
    }
  };

  const getButtonText = () => {
    if (paymentStage === 'creating') return 'Creating reservation...';
    if (paymentStage === 'redirecting') return 'Redirecting to payment...';
    if (paymentStage === 'blocked') return 'Continue to Payment';
    return 'Confirm & Pay';
  };

  const renderPaymentFallback = () => (
    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-primary" strokeWidth={1.5} />
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
        className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-6 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
      >
        Continue to Payment
        <ExternalLink className="w-4 h-4" />
      </a>
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3" />
        Secure payment via Stripe
      </p>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-8 py-16 max-w-lg mx-auto">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-primary" strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">Booking Confirmed</h2>
        <p className="text-muted-foreground">
          A confirmation has been sent to {bookingForm.guestEmail}
        </p>
      </div>
      <div className="bg-muted/30 rounded-2xl p-6 space-y-4 text-left border border-border/30">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">What's next</p>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span>Check your email for booking details and payment confirmation</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span>You'll receive check-in instructions 24 hours before arrival</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span>Contact us anytime if you have questions</span>
          </li>
        </ul>
      </div>
    </div>
  );

  if (step === 4) {
    return <div className="w-full">{renderComplete()}</div>;
  }

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-10">
        <BookingProgressBar currentStep={step} steps={steps} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left: Form Steps (~60%) */}
        <div className="lg:col-span-3 space-y-8">
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
            <>
              <PromoCodeInput
                propertyId={property.id}
                organizationId={property.organization_id}
                guestEmail={bookingForm.guestEmail}
                nights={nights}
                bookingTotal={charges.accommodationSubtotal}
                onPromoApplied={(promo) => {
                  setAppliedPromo(promo);
                  refetchCharges();
                }}
                appliedPromo={appliedPromo}
                className="mb-2"
              />
              
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
                  grandTotal: charges.grandTotal,
                  discounts: charges.discounts,
                  totalDiscount: charges.totalDiscount
                }}
              />
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={handlePreviousStep}
                size="lg"
                className="rounded-xl text-muted-foreground hover:text-foreground gap-2"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 3 && (
              <Button
                onClick={handleNextStep}
                size="lg"
                className="rounded-xl px-8 gap-2 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                disabled={step === 1 && (!selectedDates || !dateRangeValid)}
              >
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            )}
            {step === 3 && paymentStage !== 'blocked' && (
              <Button
                onClick={handleConfirmBooking}
                size="lg"
                className="rounded-xl px-10 h-14 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-0.5 gap-2"
                disabled={isProcessingPayment || !charges}
              >
                {isProcessingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" strokeWidth={1.5} />
                )}
                {getButtonText()}
              </Button>
            )}
          </div>
          {step === 3 && paymentStage === 'blocked' && checkoutUrl && renderPaymentFallback()}
          
          {/* Trust indicator on payment step */}
          {step === 3 && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 pt-2">
              <Shield className="h-3 w-3" strokeWidth={1.5} />
              Your payment is processed securely via Stripe
            </p>
          )}
        </div>

        {/* Right: Sticky Summary (~40%) */}
        <div className="lg:col-span-2">
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
