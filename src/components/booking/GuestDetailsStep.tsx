import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface GuestDetailsStepProps {
  formData: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestCount: number;
    specialRequests: string;
  };
  onFormChange: (field: string, value: string | number) => void;
  maxGuests: number;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const GuestDetailsStep = ({
  formData,
  onFormChange,
  maxGuests
}: GuestDetailsStepProps) => {
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [guestCountError, setGuestCountError] = useState<string | null>(null);

  // Validate email on change
  useEffect(() => {
    if (formData.guestEmail.length === 0) {
      setEmailValid(null);
    } else {
      setEmailValid(EMAIL_REGEX.test(formData.guestEmail));
    }
  }, [formData.guestEmail]);

  // Validate guest count
  useEffect(() => {
    if (formData.guestCount < 1) {
      setGuestCountError('At least 1 guest is required');
    } else if (formData.guestCount > maxGuests) {
      setGuestCountError(`Maximum ${maxGuests} guests allowed for this property`);
    } else {
      setGuestCountError(null);
    }
  }, [formData.guestCount, maxGuests]);

  const handleGuestCountChange = (value: string) => {
    const num = parseInt(value) || 1;
    // Clamp to valid range
    const clampedValue = Math.max(1, Math.min(num, maxGuests));
    onFormChange('guestCount', clampedValue);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Guest Information</h2>
        <p className="text-muted-foreground">Please provide your contact details</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">Full Name *</Label>
            <Input
              id="guestName"
              value={formData.guestName}
              onChange={(e) => onFormChange('guestName', e.target.value)}
              placeholder="John Doe"
              required
              className={formData.guestName.length > 0 ? 'border-green-500' : ''}
            />
            {formData.guestName.length > 0 && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Name entered
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email Address *</Label>
            <Input
              id="guestEmail"
              type="email"
              value={formData.guestEmail}
              onChange={(e) => onFormChange('guestEmail', e.target.value)}
              placeholder="john@example.com"
              required
              className={emailValid === true ? 'border-green-500' : emailValid === false ? 'border-red-500' : ''}
            />
            {emailValid === true && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Valid email
              </p>
            )}
            {emailValid === false && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Please enter a valid email address
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guestPhone">Phone Number</Label>
            <Input
              id="guestPhone"
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => onFormChange('guestPhone', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
            <p className="text-xs text-muted-foreground">
              Optional, but helps us reach you
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestCount">Number of Guests *</Label>
            <Input
              id="guestCount"
              type="number"
              min="1"
              max={maxGuests}
              value={formData.guestCount}
              onChange={(e) => handleGuestCountChange(e.target.value)}
              required
              className={guestCountError ? 'border-red-500' : ''}
            />
            {guestCountError ? (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {guestCountError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Maximum {maxGuests} guests allowed
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
          <Textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => onFormChange('specialRequests', e.target.value)}
            placeholder="Any special requests or requirements... (e.g., early check-in, late checkout, accessibility needs)"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            We'll do our best to accommodate your requests
          </p>
        </div>

        {/* Validation Summary */}
        {(formData.guestName.length === 0 || emailValid !== true) && (
          <Alert variant="default" className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              Please fill in all required fields before continuing.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
