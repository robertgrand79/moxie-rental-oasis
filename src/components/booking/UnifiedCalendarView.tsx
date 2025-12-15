import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Plus,
  DollarSign,
  Users,
  Calendar,
  Eye,
  Home,
  Loader2
} from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parseISO, isSameDay, differenceInDays } from 'date-fns';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUpdatePricing } from '@/hooks/useBookingData';
import { getPropertyColor } from '@/utils/propertyColors';
import { invalidateAllPricingQueries } from '@/utils/pricingCacheUtils';

interface BookingBlock {
  id: string;
  propertyId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalAmount?: number;
  sourcePlatform?: string;
}

interface DayColumn {
  date: Date;
  dateStr: string;
  dayOfWeek: string;
  dayNumber: number;
  monthAbbr: string;
  isToday: boolean;
  isWeekend: boolean;
}

export const UnifiedCalendarView: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 3); // Start 3 days before today
    return today;
  });
  const [daysToShow, setDaysToShow] = useState(21);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [propertySearch, setPropertySearch] = useState('');
  const [showPricing, setShowPricing] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const { properties = [] } = useProperties();
  const queryClient = useQueryClient();
  const updatePricing = useUpdatePricing();

  // Get organization-scoped property IDs
  const propertyIds = useMemo(() => properties.map(p => p.id), [properties]);

  // Fetch availability blocks - only those overlapping with visible range AND for org properties
  const visibleEndDate = format(addDays(startDate, daysToShow), 'yyyy-MM-dd');
  const visibleStartDate = format(startDate, 'yyyy-MM-dd');
  
  const { data: availabilityBlocks = [] } = useQuery({
    queryKey: ['unified-availability-blocks', visibleStartDate, visibleEndDate, propertyIds],
    queryFn: async () => {
      if (propertyIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('*')
        .in('property_id', propertyIds)
        .lt('start_date', visibleEndDate)  // Starts before visible range ends
        .gte('end_date', visibleStartDate)  // Ends after visible range starts
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: propertyIds.length > 0
  });

  // Fetch pricing data - only for org properties
  const { data: pricingData = {} } = useQuery({
    queryKey: ['unified-pricing', format(startDate, 'yyyy-MM-dd'), daysToShow, propertyIds],
    queryFn: async () => {
      if (propertyIds.length === 0) return {};
      
      const endDate = addDays(startDate, daysToShow);
      const { data, error } = await supabase
        .from('dynamic_pricing')
        .select('*')
        .in('property_id', propertyIds)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      
      const grouped: Record<string, Record<string, number>> = {};
      (data || []).forEach(p => {
        if (!grouped[p.property_id]) grouped[p.property_id] = {};
        grouped[p.property_id][p.date] = p.final_price;
      });
      return grouped;
    },
    enabled: showPricing && propertyIds.length > 0
  });

  // Generate calendar columns
  const columns = useMemo<DayColumn[]>(() => {
    const days: DayColumn[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = addDays(startDate, i);
      days.push({
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        dayOfWeek: format(date, 'EEE'),
        dayNumber: date.getDate(),
        monthAbbr: format(date, 'MMM'),
        isToday: isSameDay(date, new Date()),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    return days;
  }, [startDate, daysToShow]);

  // Convert availability blocks to booking blocks
  const bookingBlocks = useMemo<BookingBlock[]>(() => {
    return availabilityBlocks
      .filter(block => 
        block.block_type === 'booked' && 
        !(block.notes?.toLowerCase().startsWith('blocked'))
      )
      .map(block => ({
        id: block.id,
        propertyId: block.property_id,
        guestName: block.notes || 'External Booking',
        checkIn: block.start_date,
        checkOut: block.end_date,
        guestCount: block.guest_count || 1,
        sourcePlatform: block.source_platform || 'other',
      }));
  }, [availabilityBlocks]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    let filtered = properties;
    
    if (selectedProperties.length > 0) {
      filtered = filtered.filter(p => selectedProperties.includes(p.id));
    }
    
    if (propertySearch) {
      const search = propertySearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) || 
        p.location?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [properties, selectedProperties, propertySearch]);


  const navigateDays = (direction: 'prev' | 'next') => {
    const offset = direction === 'next' ? 14 : -14;
    setStartDate(prev => addDays(prev, offset));
  };

  const goToToday = () => {
    const today = new Date();
    today.setDate(today.getDate() - 3);
    setStartDate(today);
  };

  const getBookingsForProperty = (propertyId: string) => {
    return bookingBlocks.filter(b => b.propertyId === propertyId);
  };

  const getPrice = (propertyId: string, dateStr: string) => {
    return pricingData[propertyId]?.[dateStr];
  };

  const handlePropertyFilterToggle = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  // Group columns by month for header
  const monthGroups = useMemo(() => {
    const groups: { month: string; columns: DayColumn[] }[] = [];
    let currentMonth = '';
    
    columns.forEach(col => {
      const month = format(col.date, 'MMM');
      if (month !== currentMonth) {
        groups.push({ month, columns: [col] });
        currentMonth = month;
      } else {
        groups[groups.length - 1].columns.push(col);
      }
    });
    
    return groups;
  }, [columns]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const scrollRight = scrollWidth - scrollLeft - clientWidth;

    // Near right edge - load future dates
    if (scrollRight < 150) {
      isLoadingRef.current = true;
      setIsLoadingMore(true);
      setDaysToShow(prev => prev + 14);
      setTimeout(() => {
        isLoadingRef.current = false;
        setIsLoadingMore(false);
      }, 300);
    }

    // Near left edge - load past dates
    if (scrollLeft < 150) {
      isLoadingRef.current = true;
      setIsLoadingMore(true);
      const previousScrollWidth = container.scrollWidth;
      
      setStartDate(prev => addDays(prev, -14));
      setDaysToShow(prev => prev + 14);
      
      // Maintain scroll position after prepending dates
      requestAnimationFrame(() => {
        const newScrollWidth = container.scrollWidth;
        const addedWidth = newScrollWidth - previousScrollWidth;
        container.scrollLeft = scrollLeft + addedWidth;
        setTimeout(() => {
          isLoadingRef.current = false;
          setIsLoadingMore(false);
        }, 300);
      });
    }
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <Card className="overflow-hidden">
      {/* Header Controls */}
      <div className="border-b p-4 flex flex-wrap items-center justify-between gap-4 bg-background">
        <div className="flex items-center gap-3">
          {/* Date Navigation */}
          <Button variant="outline" size="icon" onClick={() => navigateDays('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-3 py-1.5 border rounded-md text-sm font-medium min-w-[200px] text-center bg-background">
            {format(startDate, 'MMM d, yyyy')} - {format(addDays(startDate, daysToShow - 1), 'MMM d, yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateDays('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Property Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-primary">
                <Filter className="h-4 w-4 mr-2" />
                Filter properties
                {selectedProperties.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{selectedProperties.length}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-3">
                <Input
                  placeholder="Search properties..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {properties.map(property => (
                    <div key={property.id} className="flex items-center gap-2">
                      <Checkbox
                        id={property.id}
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => handlePropertyFilterToggle(property.id, !!checked)}
                      />
                      <label htmlFor={property.id} className="text-sm truncate cursor-pointer">
                        {property.title}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedProperties.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedProperties([])}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Pricing Toggle */}
          <Button 
            variant={showPricing ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowPricing(!showPricing)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview dynamic pricing
          </Button>

          {/* Add Booking */}
          <Button size="sm" className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add booking
          </Button>
        </div>
      </div>

      {/* Calendar Grid - Single scrollable container with sticky property column */}
      <div className="relative overflow-x-auto" ref={scrollContainerRef}>
        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs flex items-center gap-2 shadow-lg">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading dates...
          </div>
        )}

        {/* Inner container with min-width to enable scrolling */}
        <div className="flex" style={{ minWidth: `${256 + columns.length * 64}px` }}>
          {/* Property Column - Sticky within scroll container */}
          <div className="sticky left-0 z-20 w-64 flex-shrink-0 bg-background shadow-[4px_0_8px_-4px_rgba(0,0,0,0.15)]">
            {/* Property Header */}
            <div className="h-16 border-b border-r flex items-center px-3 bg-muted/30">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Home className="h-4 w-4" />
                Property name
              </span>
            </div>
            
            {/* Property Rows */}
            {filteredProperties.map(property => (
              <PropertyRowLabel key={property.id} property={property} />
            ))}
          </div>

          {/* Calendar Area - Dates and booking rows */}
          <div className="flex-1">
            {/* Date Headers */}
            <div className="border-b bg-muted/30">
              <div className="flex">
                {columns.map((col) => (
                  <div 
                    key={col.dateStr}
                    className={cn(
                      "w-16 flex-shrink-0 text-center py-2 border-r border-border/30",
                      col.isToday && "bg-primary/10"
                    )}
                  >
                    {col.dayNumber === 1 && (
                      <div className="text-xs text-muted-foreground -mt-1">{col.monthAbbr}</div>
                    )}
                    <div className={cn(
                      "text-lg font-semibold",
                      col.isToday && "text-primary"
                    )}>
                      {col.dayNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">{col.dayOfWeek}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Rows */}
            <div>
              {filteredProperties.map(property => (
                <PropertyRow 
                  key={property.id}
                  property={property}
                  columns={columns}
                  bookings={getBookingsForProperty(property.id)}
                  pricingData={pricingData}
                  showPricing={showPricing}
                  updatePricing={updatePricing}
                  queryClient={queryClient}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Property Legend - Dynamic based on organization properties */}
      <div className="border-t p-3 flex flex-wrap items-center gap-4 text-sm bg-muted/20">
        <span className="text-muted-foreground">Properties:</span>
        {filteredProperties.map((property) => {
          const colors = getPropertyColor(property.id, property.title);
          return (
            <div key={property.id} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded', colors.bg)} />
              <span className="text-xs">{property.title}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const PropertyRowLabel: React.FC<{ property: Property }> = ({ property }) => {
  const propertyImage = property.cover_image_url || property.featured_photos?.[0] || property.images?.[0];
  
  return (
    <div className="h-16 border-b flex items-center gap-3 px-3 hover:bg-muted/20">
      <img 
        src={propertyImage || '/placeholder.svg'} 
        alt={property.title}
        className="w-10 h-10 rounded object-cover flex-shrink-0"
      />
      <span className="text-sm font-medium truncate">{property.title}</span>
    </div>
  );
};

interface PropertyRowProps {
  property: Property;
  columns: DayColumn[];
  bookings: BookingBlock[];
  pricingData: Record<string, Record<string, number>>;
  showPricing: boolean;
  updatePricing: ReturnType<typeof useUpdatePricing>;
  queryClient: ReturnType<typeof useQueryClient>;
}

const PropertyRow: React.FC<PropertyRowProps> = ({
  property,
  columns,
  bookings,
  pricingData,
  showPricing,
  updatePricing,
  queryClient
}) => {
  // Calculate booking positions and widths
  const bookingPositions = useMemo(() => {
    const rangeStart = columns[0]?.dateStr;
    const rangeEnd = columns[columns.length - 1]?.dateStr;
    
    if (!rangeStart || !rangeEnd) return [];
    
    return bookings.map(booking => {
      const checkInDate = parseISO(booking.checkIn);
      const checkOutDate = parseISO(booking.checkOut);
      
      // Skip bookings that don't overlap with visible range
      if (booking.checkOut <= rangeStart || booking.checkIn > rangeEnd) {
        return null;
      }
      
      // Calculate visible start index
      let visibleStart = 0;
      if (booking.checkIn >= rangeStart) {
        visibleStart = columns.findIndex(col => col.dateStr === booking.checkIn);
        if (visibleStart === -1) visibleStart = 0;
      }
      
      // Calculate visible end index (checkout day is exclusive for nights but we want to show half-day)
      let visibleEnd = columns.length;
      let isCheckoutDayVisible = false;
      if (booking.checkOut <= rangeEnd) {
        const endIdx = columns.findIndex(col => col.dateStr === booking.checkOut);
        if (endIdx !== -1) {
          visibleEnd = endIdx;
          isCheckoutDayVisible = true;
        }
      }
      
      const span = visibleEnd - visibleStart;
      if (span <= 0) return null;
      
      const nights = differenceInDays(checkOutDate, checkInDate);
      
      return {
        booking,
        startCol: visibleStart,
        span,
        isStartVisible: booking.checkIn >= rangeStart,
        isEndVisible: booking.checkOut <= rangeEnd,
        isCheckoutDayVisible,
        nights
      };
    }).filter(Boolean);
  }, [bookings, columns]);

  return (
    <div className="h-16 border-b relative">
      {/* Price cells background */}
      <div className="flex h-full">
        {columns.map((col) => {
          const price = pricingData[property.id]?.[col.dateStr];
          const hasBooking = bookings.some(b => {
            const checkIn = b.checkIn;
            const checkOut = b.checkOut;
            return col.dateStr >= checkIn && col.dateStr < checkOut;
          });
          
          return (
            <PriceCell
              key={col.dateStr}
              propertyId={property.id}
              dateStr={col.dateStr}
              price={price}
              showPricing={showPricing && !hasBooking}
              isWeekend={col.isWeekend}
              isToday={col.isToday}
              updatePricing={updatePricing}
              queryClient={queryClient}
            />
          );
        })}
      </div>

      {/* Booking bars overlay */}
      {bookingPositions.map((pos) => {
        if (!pos) return null;
        const { booking, startCol, span, isStartVisible, isEndVisible, isCheckoutDayVisible } = pos;
        const propertyColors = getPropertyColor(booking.propertyId);
        const platform = booking.sourcePlatform?.toLowerCase() || 'other';
        
        // Add half-cell width for checkout day visualization
        const totalWidth = isCheckoutDayVisible ? (span * 64) + 32 : span * 64;
        
        return (
          <Popover key={booking.id}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "absolute top-2 bottom-2 flex items-center cursor-pointer transition-opacity hover:opacity-90 overflow-hidden",
                  propertyColors.bg,
                  propertyColors.text,
                  isStartVisible && "rounded-l-full",
                  // Only round right if checkout is NOT visible (continues past view)
                  isEndVisible && !isCheckoutDayVisible && "rounded-r-full"
                )}
                style={{
                  left: `${startCol * 64}px`,
                  width: `${totalWidth}px`,
                  // Add gradient fade on checkout day for half-day visualization
                  ...(isCheckoutDayVisible && {
                    maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                  }),
                }}
              >
                <div className="flex items-center gap-2 px-3 overflow-hidden">
                  <Avatar className="h-6 w-6 flex-shrink-0 border border-white/30">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.guestName}`} />
                    <AvatarFallback className="text-xs bg-white/20">
                      {booking.guestName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {booking.guestName.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <PlatformIcon platform={platform} />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <BookingPopoverContent booking={booking} />
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
};

const PriceCell: React.FC<{
  propertyId: string;
  dateStr: string;
  price?: number;
  showPricing: boolean;
  isWeekend: boolean;
  isToday: boolean;
  updatePricing: ReturnType<typeof useUpdatePricing>;
  queryClient: ReturnType<typeof useQueryClient>;
}> = ({ propertyId, dateStr, price, showPricing, isWeekend, isToday, updatePricing, queryClient }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [priceValue, setPriceValue] = useState(price?.toString() || '');

  const handleSave = async () => {
    const newPrice = parseFloat(priceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await updatePricing.mutateAsync({
        property_id: propertyId,
        date: dateStr,
        base_price: price || newPrice,
        manual_override_price: newPrice,
        final_price: newPrice,
        pricing_source: 'manual'
      });
      toast.success(`Price updated to $${newPrice}`);
      invalidateAllPricingQueries(queryClient);
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "w-16 h-full flex-shrink-0 border-r border-border/30 flex flex-col items-center justify-center cursor-pointer",
            "hover:bg-accent/20 transition-colors",
            isWeekend && "bg-muted/20",
            isToday && "bg-primary/5"
          )}
        >
          {showPricing && price && (
            <>
              <span className="text-sm font-medium">${price}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Users className="h-3 w-3" />2
              </span>
            </>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            Set Price
          </div>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(dateStr), 'MMM d, yyyy')}
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Price"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSave} disabled={updatePricing.isPending}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  if (platform === 'airbnb') {
    return (
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <span className="text-xs">🏠</span>
      </div>
    );
  }
  if (platform === 'vrbo') {
    return (
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold">V</span>
      </div>
    );
  }
  return null;
};

const BookingPopoverContent: React.FC<{ booking: BookingBlock }> = ({ booking }) => {
  const checkIn = parseISO(booking.checkIn);
  const checkOut = parseISO(booking.checkOut);
  const nights = differenceInDays(checkOut, checkIn);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.guestName}`} />
          <AvatarFallback>{booking.guestName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold">{booking.guestName}</h4>
          <Badge variant="outline" className="capitalize text-xs">
            {booking.sourcePlatform}
          </Badge>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Check-in
          </span>
          <span className="font-medium">{format(checkIn, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Check-out
          </span>
          <span className="font-medium">{format(checkOut, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Nights</span>
          <span className="font-medium">{nights}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> Guests
          </span>
          <span className="font-medium">{booking.guestCount}</span>
        </div>
      </div>
    </div>
  );
};
