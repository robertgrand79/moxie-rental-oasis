import React, { useMemo, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAvailability } from '@/hooks/useBookingData';
import { format, parseISO } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface DateSelectionStepProps {
  propertyId: string;
  selectedDates: { from: Date | undefined; to: Date | undefined };
  onDateSelect: (range: { from: Date | undefined; to: Date | undefined } | undefined) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const DateSelectionStep = ({
  propertyId,
  selectedDates,
  onDateSelect,
  onValidationChange
}: DateSelectionStepProps) => {
  const { data: availabilityBlocks } = useAvailability(
    propertyId,
    {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    }
  );

  // Calculate blocked dates (excluding checkout day - it's available for check-in)
  const disabledDates = useMemo(() => {
    const disabled: Date[] = [];
    
    availabilityBlocks?.forEach(block => {
      const start = parseISO(block.start_date);
      const end = parseISO(block.end_date);
      
      // Only block dates up to (but NOT including) the checkout day
      // Checkout day is available for new check-ins (same-day turnover)
      for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
        disabled.push(new Date(date));
      }
    });
    
    return disabled;
  }, [availabilityBlocks]);

  // Calculate checkout dates for half-day visual indicator
  const checkoutDates = useMemo(() => {
    return availabilityBlocks?.map(block => parseISO(block.end_date)) || [];
  }, [availabilityBlocks]);

  // Check if selected range contains any unavailable dates
  const hasUnavailableDatesInRange = useMemo(() => {
    if (!selectedDates.from || !selectedDates.to) return false;
    
    return disabledDates.some(disabledDate => 
      disabledDate >= selectedDates.from! && 
      disabledDate < selectedDates.to!
    );
  }, [selectedDates, disabledDates]);

  // Notify parent of validation state changes
  useEffect(() => {
    onValidationChange?.(!hasUnavailableDatesInRange);
  }, [hasUnavailableDatesInRange, onValidationChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select your dates</h2>
        <p className="text-muted-foreground">Choose your check-in and check-out dates</p>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="range"
          selected={selectedDates}
          onSelect={onDateSelect}
          disabled={(date) => 
            date < new Date() || 
            disabledDates.some(disabledDate => 
              format(disabledDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            )
          }
          modifiers={{
            checkout: checkoutDates
          }}
          modifiersClassNames={{
            checkout: "relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-amber-200 before:via-amber-100 before:via-50% before:to-transparent before:to-50% dark:before:from-amber-900/50 dark:before:via-amber-900/25 dark:before:to-transparent before:z-0 [&>*]:relative [&>*]:z-10"
          }}
          numberOfMonths={2}
          className="rounded-lg border bg-card p-4 pointer-events-auto"
        />
      </div>

      {hasUnavailableDatesInRange && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dates Unavailable</AlertTitle>
          <AlertDescription>
            One or more dates in your selected range are already booked. 
            Please select a different date range.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="outline" className="text-xs gap-2">
          <div className="w-3 h-3 border border-muted-foreground/30 rounded-sm" />
          Available
        </Badge>
        <Badge variant="secondary" className="text-xs gap-2">
          <div className="w-3 h-3 bg-primary rounded-sm" />
          Selected
        </Badge>
        <Badge variant="outline" className="text-xs gap-2">
          <div className="w-3 h-3 relative overflow-hidden rounded-sm bg-gradient-to-tr from-amber-200 via-amber-100 via-50% to-white to-50% dark:from-amber-900/50 dark:via-amber-900/25 dark:to-background" />
          Check-out Day
        </Badge>
        <Badge variant="outline" className="text-xs gap-2">
          <div className="w-3 h-3 relative overflow-hidden rounded-sm bg-muted before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,hsl(var(--destructive))_3px,hsl(var(--destructive))_4px)] before:opacity-40" />
          Unavailable
        </Badge>
      </div>
    </div>
  );
};
