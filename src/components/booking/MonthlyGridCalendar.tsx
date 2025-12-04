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
  differenceInDays,
  isBefore,
  isAfter
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, User, CalendarDays } from 'lucide-react';
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

interface BookingSegment {
  booking: BookingBlock;
  startCol: number;
  span: number;
  isStartVisible: boolean;
  isEndVisible: boolean;
  isCheckoutDayVisible: boolean;
  track: number;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthlyGridCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  
  const { properties = [] } = useProperties();

  // Calculate visible date range for query optimization
  const { visibleStart, visibleEnd } = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    return {
      visibleStart: format(startOfWeek(firstDay, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      visibleEnd: format(addDays(endOfWeek(lastDay, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd')
    };
  }, [currentMonth]);

  // Fetch availability blocks - only for visible range
  const { data: availabilityBlocks = [] } = useQuery({
    queryKey: ['monthly-availability-blocks', visibleStart, visibleEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('*')
        .eq('block_type', 'booked')
        .lt('start_date', visibleEnd)
        .gte('end_date', visibleStart);
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

  // Generate calendar days grouped into weeks
  const weeks = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const startDate = startOfWeek(firstDay, { weekStartsOn: 1 });
    const endDate = endOfWeek(lastDay, { weekStartsOn: 1 });
    
    const allDays: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      allDays.push(day);
      day = addDays(day, 1);
    }
    
    // Group into weeks of 7 days
    const weekRows: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weekRows.push(allDays.slice(i, i + 7));
    }
    return weekRows;
  }, [currentMonth]);

  const goToToday = () => setCurrentMonth(new Date());
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <Card className="overflow-hidden">
      {/* Header Controls */}
      <div className="border-b p-4 flex flex-wrap items-center justify-between gap-4 bg-background">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold">Monthly View</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger className="w-[180px]">
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
      <div className="flex items-center justify-center gap-4 py-4 border-b bg-muted/30">
        <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold min-w-[160px] text-center">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Property Legend */}
      <div className="flex flex-wrap justify-center gap-4 py-3 border-b text-sm bg-background">
        {getAllPropertyColors().map((prop) => (
          <span key={prop.id} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded', prop.bg)} />
            <span className="text-xs">{prop.name}</span>
          </span>
        ))}
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {DAY_NAMES.map(day => (
          <div 
            key={day} 
            className="py-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Weeks */}
      <div>
        {weeks.map((weekDays, weekIndex) => (
          <WeekRow 
            key={weekIndex}
            weekDays={weekDays}
            currentMonth={currentMonth}
            bookings={filteredBookings}
          />
        ))}
      </div>
    </Card>
  );
};

interface WeekRowProps {
  weekDays: Date[];
  currentMonth: Date;
  bookings: BookingBlock[];
}

const WeekRow: React.FC<WeekRowProps> = ({ weekDays, currentMonth, bookings }) => {
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  
  // Calculate booking segments for this week
  const bookingSegments = useMemo(() => {
    const segments: BookingSegment[] = [];
    
    bookings.forEach(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      const lastNight = addDays(checkOut, -1);
      
      // Check if booking overlaps with this week (including checkout day for half-day display)
      if (isAfter(checkIn, weekEnd) || isBefore(checkOut, weekStart)) {
        return; // No overlap
      }
      
      // Calculate visible portion within this week
      const visibleStart = isBefore(checkIn, weekStart) ? weekStart : checkIn;
      // Include checkout day in the span for half-day visualization
      const visibleEnd = isAfter(lastNight, weekEnd) ? weekEnd : lastNight;
      
      const startCol = differenceInDays(visibleStart, weekStart);
      const span = differenceInDays(visibleEnd, visibleStart) + 1;
      
      const isStartVisible = !isBefore(checkIn, weekStart);
      const isEndVisible = !isAfter(lastNight, weekEnd);
      // Check if checkout day falls within this week
      const isCheckoutDayVisible = !isBefore(checkOut, weekStart) && !isAfter(checkOut, addDays(weekEnd, 1));
      
      segments.push({
        booking,
        startCol,
        span,
        isStartVisible,
        isEndVisible,
        isCheckoutDayVisible,
        track: 0, // Will be assigned below
      });
    });
    
    // Assign tracks to avoid overlaps
    segments.sort((a, b) => a.startCol - b.startCol);
    const tracks: { endCol: number }[] = [];
    
    segments.forEach(segment => {
      // Find first available track
      let trackIndex = tracks.findIndex(t => t.endCol < segment.startCol);
      if (trackIndex === -1) {
        trackIndex = tracks.length;
        tracks.push({ endCol: -1 });
      }
      segment.track = trackIndex;
      tracks[trackIndex].endCol = segment.startCol + segment.span - 1;
    });
    
    return segments;
  }, [bookings, weekStart, weekEnd]);
  
  const maxTracks = Math.max(1, ...bookingSegments.map(s => s.track + 1));
  const cellHeight = 28 + maxTracks * 22; // Base height + track heights
  
  return (
    <div className="relative grid grid-cols-7">
      {/* Day cells as background */}
      {weekDays.map((date, colIndex) => {
        const isCurrentMonth = isSameMonth(date, currentMonth);
        const isToday = isSameDay(date, new Date());
        
        return (
          <div
            key={colIndex}
            style={{ minHeight: `${cellHeight}px` }}
            className={cn(
              'bg-background p-1.5 border-r border-b last:border-r-0',
              !isCurrentMonth && 'bg-muted/20',
              isToday && 'ring-2 ring-inset ring-primary'
            )}
          >
            <span 
              className={cn(
                'text-sm font-medium inline-flex items-center justify-center w-6 h-6 rounded-full',
                !isCurrentMonth && 'text-muted-foreground',
                isToday && 'bg-primary text-primary-foreground'
              )}
            >
              {format(date, 'd')}
            </span>
          </div>
        );
      })}
      
      {/* Booking overlays */}
      {bookingSegments.map((segment, idx) => (
        <BookingOverlay key={`${segment.booking.id}-${idx}`} segment={segment} />
      ))}
    </div>
  );
};

interface BookingOverlayProps {
  segment: BookingSegment;
}

const BookingOverlay: React.FC<BookingOverlayProps> = ({ segment }) => {
  const { booking, startCol, span, isStartVisible, isEndVisible, isCheckoutDayVisible, track } = segment;
  const colors = getPropertyColor(booking.propertyId);
  
  const leftPercent = (startCol / 7) * 100;
  // If checkout day is visible and the booking ends in this week, reduce width by half a cell
  const widthPercent = isEndVisible && isCheckoutDayVisible
    ? ((span + 0.5) / 7) * 100  // Add half cell for checkout day
    : (span / 7) * 100;
  const topOffset = 28 + track * 22; // Below day number + track offset
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'absolute h-5 text-xs truncate cursor-pointer transition-opacity hover:opacity-80 flex items-center overflow-hidden',
            colors.bg,
            colors.text,
            isStartVisible && 'rounded-l-full pl-2',
            // Only round right if checkout is visible (half-day display)
            isEndVisible && !isCheckoutDayVisible && 'rounded-r-full pr-1',
            !isStartVisible && !isEndVisible && 'px-1'
          )}
          style={{
            left: `calc(${leftPercent}% + 4px)`,
            width: `calc(${widthPercent}% - 8px)`,
            top: `${topOffset}px`,
            // Add gradient fade on checkout day
            ...(isEndVisible && isCheckoutDayVisible && {
              maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
            }),
          }}
        >
          {isStartVisible && (
            <span className="truncate">{booking.guestName}</span>
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
            <Badge variant="secondary" className="capitalize text-xs">
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
