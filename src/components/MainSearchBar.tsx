import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Search, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

const MainSearchBar = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<string>('2');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    // Auto-close when both dates are selected
    if (range?.from && range?.to) {
      setCalendarOpen(false);
    }
  };

  const handleSearch = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }

    if (dateRange.to <= dateRange.from) {
      toast.error('Check-out must be after check-in');
      return;
    }

    const params = new URLSearchParams({
      checkin: format(dateRange.from, 'yyyy-MM-dd'),
      checkout: format(dateRange.to, 'yyyy-MM-dd'),
      guests: guests,
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <Card className="p-4 md:p-6 shadow-xl bg-card/95 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-end">
        {/* Date Range Picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <div className="flex flex-col sm:flex-row flex-1 gap-3 md:gap-4">
            {/* Check-in Field */}
            <div className="flex-1 space-y-1.5 md:space-y-2 w-full">
              <label className="text-sm font-medium">Check-in</label>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-11',
                    !dateRange?.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {dateRange?.from ? format(dateRange.from, 'MMM dd, yyyy') : 'Select date'}
                  </span>
                </Button>
              </PopoverTrigger>
            </div>

            {/* Check-out Field */}
            <div className="flex-1 space-y-1.5 md:space-y-2 w-full">
              <label className="text-sm font-medium">Check-out</label>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-11',
                    !dateRange?.to && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {dateRange?.to ? format(dateRange.to, 'MMM dd, yyyy') : 'Select date'}
                  </span>
                </Button>
              </PopoverTrigger>
            </div>
          </div>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <div className="flex-1 space-y-1.5 md:space-y-2 w-full md:max-w-[180px]">
          <label className="text-sm font-medium">Guests</label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          size="lg"
          disabled={!dateRange?.from || !dateRange?.to}
          className="w-full md:w-auto md:min-w-[120px] h-11"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </Card>
  );
};

export default MainSearchBar;
