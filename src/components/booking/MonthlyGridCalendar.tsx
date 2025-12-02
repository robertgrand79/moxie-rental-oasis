import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  parseISO, 
  addMonths, 
  subMonths,
  isWithinInterval
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, User, Home, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProperties } from '@/hooks/useProperties';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPropertyColor, getAllPropertyColors } from '@/utils/propertyColors';

interface BookingBlock {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  sourcePlatform: string;
  guestCount?: number;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthlyGridCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  
  const { properties = [] } = useProperties();

  // Fetch availability blocks
  const { data: availabilityBlocks = [] } = useQuery({
    queryKey: ['monthly-availability-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('*')
        .eq('block_type', 'booked');
      if (error) throw error;
      return data || [];
    }
  });

  // Convert availability blocks to booking blocks (filter out "Blocked" sync entries)
  const bookingBlocks = useMemo<BookingBlock[]>(() => {
    return availabilityBlocks
      .filter(block => 
        block.block_type === 'booked' && 
        !(block.notes?.toLowerCase().startsWith('blocked'))
      )
      .map(block => {
        const property = properties.find(p => p.id === block.property_id);
        return {
          id: `availability-${block.id}`,
          propertyId: block.property_id,
          propertyTitle: property?.title || 'Unknown Property',
          guestName: block.notes || 'External Booking',
          checkIn: block.start_date,
          checkOut: block.end_date,
          sourcePlatform: block.source_platform || 'other',
          guestCount: block.guest_count || undefined,
        };
      });
  }, [availabilityBlocks, properties]);

  // Filter by property
  const filteredBookings = useMemo(() => {
    if (selectedPropertyId === 'all') return bookingBlocks;
    return bookingBlocks.filter(b => b.propertyId === selectedPropertyId);
  }, [bookingBlocks, selectedPropertyId]);

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const startDate = startOfWeek(firstDay, { weekStartsOn: 1 });
    const endDate = endOfWeek(lastDay, { weekStartsOn: 1 });
    
    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Get bookings for a specific day
  const getBookingsForDay = (date: Date) => {
    return filteredBookings.filter(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      return isWithinInterval(date, { start: checkIn, end: addDays(checkOut, -1) });
    });
  };

  const goToToday = () => setCurrentMonth(new Date());
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Monthly View
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[180px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Property Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
          {getAllPropertyColors().map((prop) => (
            <span key={prop.id} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded', prop.bg)} />
              <span className="text-xs">{prop.name}</span>
            </span>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-t-lg overflow-hidden">
          {DAY_NAMES.map(day => (
            <div 
              key={day} 
              className="bg-muted py-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-border border border-t-0 rounded-b-lg overflow-hidden">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isSameDay(date, new Date());
            const dayBookings = getBookingsForDay(date);
            
            return (
              <div
                key={index}
                className={cn(
                  'min-h-[100px] bg-background p-1 relative',
                  !isCurrentMonth && 'bg-muted/30',
                  isToday && 'ring-2 ring-inset ring-primary'
                )}
              >
                {/* Day Number */}
                <span 
                  className={cn(
                    'text-sm font-medium inline-flex items-center justify-center w-6 h-6 rounded-full',
                    !isCurrentMonth && 'text-muted-foreground',
                    isToday && 'bg-primary text-primary-foreground'
                  )}
                >
                  {format(date, 'd')}
                </span>
                
                {/* Booking Bars */}
                <div className="space-y-0.5 mt-1">
                  {dayBookings.slice(0, 3).map(booking => (
                    <BookingBar 
                      key={booking.id} 
                      booking={booking} 
                      date={date}
                      showPropertyName={selectedPropertyId === 'all'}
                    />
                  ))}
                  {dayBookings.length > 3 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          +{dayBookings.length - 3} more
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2">
                        <div className="space-y-1">
                          {dayBookings.slice(3).map(booking => (
                            <BookingBar 
                              key={booking.id} 
                              booking={booking} 
                              date={date}
                              showPropertyName={selectedPropertyId === 'all'}
                              expanded
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface BookingBarProps {
  booking: BookingBlock;
  date: Date;
  showPropertyName?: boolean;
  expanded?: boolean;
}

const BookingBar: React.FC<BookingBarProps> = ({ booking, date, showPropertyName, expanded }) => {
  const isCheckIn = isSameDay(date, parseISO(booking.checkIn));
  const isCheckOut = isSameDay(date, addDays(parseISO(booking.checkOut), -1));
  const colors = getPropertyColor(booking.propertyId);
  
  // Determine label to show
  const label = isCheckIn 
    ? booking.guestName 
    : showPropertyName 
      ? booking.propertyTitle 
      : '';
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full h-5 text-xs truncate cursor-pointer transition-opacity hover:opacity-80',
            colors.bg,
            colors.text,
            isCheckIn && 'rounded-l-md pl-1',
            isCheckOut && 'rounded-r-md',
            !isCheckIn && !isCheckOut && 'px-0',
            expanded && 'rounded-md px-1'
          )}
        >
          {(isCheckIn || expanded) && (
            <span className="truncate">{label}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{booking.guestName}</h4>
              <p className="text-sm text-muted-foreground">{booking.propertyTitle}</p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {booking.sourcePlatform}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Check-in</p>
                <p className="font-medium">{format(parseISO(booking.checkIn), 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Check-out</p>
                <p className="font-medium">{format(parseISO(booking.checkOut), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </div>
          
          {booking.guestCount && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
