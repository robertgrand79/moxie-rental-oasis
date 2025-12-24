import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/useBookingData';
import { BookingCalendarProps } from '@/types/booking';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  propertyId,
  onDateSelect,
  selectedDates,
  unavailableDates = []
}) => {
  const isMobile = useIsMobile();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  
  const { data: availabilityBlocks } = useAvailability(
    propertyId || '',
    propertyId ? {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    } : undefined
  );

  const disabledDates = useMemo(() => {
    const disabled: Date[] = [];
    
    // Add unavailable dates from props
    unavailableDates.forEach(dateStr => {
      disabled.push(parseISO(dateStr));
    });
    
    // Add dates from availability blocks
    availabilityBlocks?.forEach(block => {
      const start = parseISO(block.start_date);
      const end = parseISO(block.end_date);
      
      // Add all dates in the range
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        disabled.push(new Date(date));
      }
    });
    
    return disabled;
  }, [availabilityBlocks, unavailableDates]);

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range) return;
    
    setDateRange(range);
    
    if (range.from && range.to && onDateSelect) {
      onDateSelect({
        start: format(range.from, 'yyyy-MM-dd'),
        end: format(range.to, 'yyyy-MM-dd')
      });
    }
  };

  const getDateStatus = (date: Date) => {
    const isDisabled = disabledDates.some(disabledDate => 
      format(disabledDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    if (isDisabled) {
      const block = availabilityBlocks?.find(block => 
        isWithinInterval(date, {
          start: parseISO(block.start_date),
          end: parseISO(block.end_date)
        })
      );
      
      return {
        disabled: true,
        status: block?.block_type || 'unavailable'
      };
    }
    
    return { disabled: false, status: 'available' };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            disabled={(date) => disabledDates.some(disabledDate => 
              format(disabledDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            )}
            numberOfMonths={isMobile ? 1 : 2}
            className="rounded-md border max-w-full overflow-x-auto"
          />
          
          {selectedDates && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected Dates:</p>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(selectedDates.start), 'MMM dd, yyyy')} - {format(parseISO(selectedDates.end), 'MMM dd, yyyy')}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive" className="text-xs">
              <div className="w-2 h-2 bg-destructive rounded-full mr-1" />
              Unavailable
            </Badge>
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-muted rounded-full mr-1" />
              Available
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-secondary rounded-full mr-1" />
              Selected
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};