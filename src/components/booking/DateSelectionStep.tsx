import React, { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/useBookingData';
import { format, parseISO } from 'date-fns';

interface DateSelectionStepProps {
  propertyId: string;
  selectedDates: { from: Date | undefined; to: Date | undefined };
  onDateSelect: (range: { from: Date | undefined; to: Date | undefined } | undefined) => void;
}

export const DateSelectionStep = ({
  propertyId,
  selectedDates,
  onDateSelect
}: DateSelectionStepProps) => {
  const { data: availabilityBlocks } = useAvailability(
    propertyId,
    {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    }
  );

  const disabledDates = useMemo(() => {
    const disabled: Date[] = [];
    
    availabilityBlocks?.forEach(block => {
      const start = parseISO(block.start_date);
      const end = parseISO(block.end_date);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        disabled.push(new Date(date));
      }
    });
    
    return disabled;
  }, [availabilityBlocks]);

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
          numberOfMonths={2}
          className="rounded-lg border bg-card p-4 pointer-events-auto"
        />
      </div>

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
          <div className="w-3 h-3 relative overflow-hidden rounded-sm bg-muted before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,hsl(var(--destructive))_3px,hsl(var(--destructive))_4px)] before:opacity-40" />
          Unavailable
        </Badge>
      </div>
    </div>
  );
};
