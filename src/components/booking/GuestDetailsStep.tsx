import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export const GuestDetailsStep = ({
  formData,
  onFormChange,
  maxGuests
}: GuestDetailsStepProps) => {
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
            />
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
            />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestCount">Number of Guests *</Label>
            <Input
              id="guestCount"
              type="number"
              min="1"
              max={maxGuests}
              value={formData.guestCount}
              onChange={(e) => onFormChange('guestCount', parseInt(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">Maximum {maxGuests} guests</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
          <Textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => onFormChange('specialRequests', e.target.value)}
            placeholder="Any special requests or requirements..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};
