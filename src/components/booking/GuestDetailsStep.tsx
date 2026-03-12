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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const GuestDetailsStep = ({
  formData,
  onFormChange,
  maxGuests
}: GuestDetailsStepProps) => {
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [guestCountError, setGuestCountError] = useState<string | null>(null);

  useEffect(() => {
    if (formData.guestEmail.length === 0) setEmailValid(null);
    else setEmailValid(EMAIL_REGEX.test(formData.guestEmail));
  }, [formData.guestEmail]);

  useEffect(() => {
    if (formData.guestCount < 1) setGuestCountError('At least 1 guest is required');
    else if (formData.guestCount > maxGuests) setGuestCountError(`Maximum ${maxGuests} guests allowed`);
    else setGuestCountError(null);
  }, [formData.guestCount, maxGuests]);

  const handleGuestCountChange = (value: string) => {
    const num = parseInt(value) || 1;
    onFormChange('guestCount', Math.max(1, Math.min(num, maxGuests)));
  };

  // Quiet luxury input classes — no heavy borders, subtle bg, soft focus ring
  const inputClasses = "border-0 bg-muted/30 rounded-xl h-12 px-4 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 transition-all";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Guest information</h2>
        <p className="text-sm text-muted-foreground">We'll use this to send your confirmation</p>
      </div>

      <div className="space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="text-xs font-medium tracking-wide text-muted-foreground">Full Name *</Label>
            <Input
              id="guestName"
              value={formData.guestName}
              onChange={(e) => onFormChange('guestName', e.target.value)}
              placeholder="Jane Smith"
              required
              className={inputClasses}
            />
            {formData.guestName.length > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" strokeWidth={1.5} /> Looks good
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail" className="text-xs font-medium tracking-wide text-muted-foreground">Email Address *</Label>
            <Input
              id="guestEmail"
              type="email"
              value={formData.guestEmail}
              onChange={(e) => onFormChange('guestEmail', e.target.value)}
              placeholder="jane@example.com"
              required
              className={inputClasses}
            />
            {emailValid === true && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" strokeWidth={1.5} /> Valid email
              </p>
            )}
            {emailValid === false && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Please enter a valid email
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="guestPhone" className="text-xs font-medium tracking-wide text-muted-foreground">Phone Number</Label>
            <Input
              id="guestPhone"
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => onFormChange('guestPhone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              className={inputClasses}
            />
            <p className="text-[11px] text-muted-foreground/60">Optional</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestCount" className="text-xs font-medium tracking-wide text-muted-foreground">Guests *</Label>
            <Input
              id="guestCount"
              type="number"
              min="1"
              max={maxGuests}
              value={formData.guestCount}
              onChange={(e) => handleGuestCountChange(e.target.value)}
              required
              className={inputClasses}
            />
            {guestCountError ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {guestCountError}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground/60">
                Up to {maxGuests}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequests" className="text-xs font-medium tracking-wide text-muted-foreground">Special Requests</Label>
          <Textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => onFormChange('specialRequests', e.target.value)}
            placeholder="Early check-in, late checkout, accessibility needs..."
            rows={3}
            className="border-0 bg-muted/30 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 transition-all resize-none"
          />
        </div>

        {/* Validation hint */}
        {(formData.guestName.length === 0 || emailValid !== true) && (
          <div className="rounded-xl bg-muted/30 border border-border/30 px-4 py-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground">
              Fill in name and email to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
