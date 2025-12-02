import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Eye, Layers as LayersIcon, Users as UsersIcon, Plus, Home, Cloud, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';
import { usePriceLabsSync } from '@/hooks/usePriceLabsSync';
import { useProperties } from '@/hooks/useProperties';
import { useReservations, useDynamicPricing, useUpdatePricing } from '@/hooks/useBookingData';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfDay, parseISO, isSameDay, differenceInDays } from 'date-fns';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface BookingBlock {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalAmount?: number;
  status: string;
  sourcePlatform?: string;
}

interface DayCell {
  date: Date;
  dateStr: string;
  dayOfWeek: string;
  dayNumber: number;
  monthAbbr: string;
  isToday: boolean;
  isWeekend: boolean;
}

interface PricingCalendarViewProps {
  onAddBooking?: (propertyId: string, date: string) => void;
}

export const PricingCalendarView: React.FC<PricingCalendarViewProps> = ({ onAddBooking }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(21); // ~3 weeks
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [propertySearch, setPropertySearch] = useState('');
  const [showLayers, setShowLayers] = useState({
    pricing: true,
    occupancy: true,
    tasks: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { properties = [] } = useProperties();
  const { data: allReservations = [] } = useReservations();
  const { syncPricing, isSyncing } = usePriceLabsSync();

  // Fetch availability blocks
  const { data: availabilityBlocks = [] } = useQuery({
    queryKey: ['all-availability-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('*')
        .gte('end_date', format(startDate, 'yyyy-MM-dd'))
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Generate calendar days
  const calendarDays = useMemo<DayCell[]>(() => {
    const days: DayCell[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = addDays(startDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      days.push({
        date,
        dateStr,
        dayOfWeek: format(date, 'EEE'),
        dayNumber: date.getDate(),
        monthAbbr: format(date, 'MMM'),
        isToday: isSameDay(date, new Date()),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    return days;
  }, [startDate, daysToShow]);

  // Convert availability blocks (from synced external calendars) to booking blocks
  // Only show external calendar bookings, not direct reservations
  const bookingBlocks = useMemo<BookingBlock[]>(() => {
    const availabilityBookingBlocks = availabilityBlocks
      .filter(block => block.block_type === 'booked')
      .map(block => ({
        id: `availability-${block.id}`,
        propertyId: block.property_id,
        guestName: block.notes || 'External Booking',
        guestEmail: block.external_booking_id || '',
        checkIn: block.start_date,
        checkOut: block.end_date,
        guestCount: block.guest_count || 1,
        totalAmount: undefined,
        status: 'confirmed',
        sourcePlatform: block.source_platform
      }));

    return availabilityBookingBlocks;
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
        p.location.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [properties, selectedProperties, propertySearch]);

  // Get booking for property/date
  const getBookingForCell = (propertyId: string, dateStr: string) => {
    return bookingBlocks.find(b => {
      const checkIn = b.checkIn.slice(0, 10);
      const checkOut = b.checkOut.slice(0, 10);
      return b.propertyId === propertyId && dateStr >= checkIn && dateStr < checkOut;
    });
  };

  // Get pricing for property/date
  const { data: pricingData = {} } = useQuery({
    queryKey: ['calendar-pricing', startDate, daysToShow],
    queryFn: async () => {
      const endDate = addDays(startDate, daysToShow);
      const { data, error } = await supabase
        .from('dynamic_pricing')
        .select('*')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      
      // Group by property_id and date
      const grouped: Record<string, Record<string, number>> = {};
      data.forEach(p => {
        if (!grouped[p.property_id]) grouped[p.property_id] = {};
        grouped[p.property_id][p.date] = p.final_price;
      });
      return grouped;
    },
    enabled: showLayers.pricing
  });

  const getPriceForCell = (propertyId: string, dateStr: string) => {
    return pricingData[propertyId]?.[dateStr];
  };

  const getStatusColor = (sourcePlatform?: string) => {
    switch (sourcePlatform) {
      case 'airbnb': return 'bg-[#FF5A5F]';
      case 'vrbo': return 'bg-[#0D47A1]';
      case 'booking_com': return 'bg-[#003580]';
      case 'direct': return 'bg-teal-500';
      default: return 'bg-primary';
    }
  };

  const getPlatformIcon = (sourcePlatform?: string) => {
    switch (sourcePlatform) {
      case 'airbnb': return <Home className="h-3 w-3" />;
      case 'vrbo': return <Home className="h-3 w-3" />;
      case 'booking_com': return <Cloud className="h-3 w-3" />;
      default: return null;
    }
  };

  const navigateDays = (direction: 'prev' | 'next') => {
    const offset = direction === 'next' ? daysToShow : -daysToShow;
    setStartDate(prev => addDays(prev, offset));
  };

  const updatePricing = useUpdatePricing();
  const queryClient = useQueryClient();

  const PriceEditCell = ({ 
    propertyId, 
    dateStr, 
    price, 
    isWeekend,
    showPricing,
    onAddBooking 
  }: { 
    propertyId: string; 
    dateStr: string; 
    price?: number;
    isWeekend: boolean;
    showPricing: boolean;
    onAddBooking?: (propertyId: string, date: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [priceValue, setPriceValue] = useState(price?.toString() || '');
    
    const handleSavePrice = async () => {
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
        queryClient.invalidateQueries({ queryKey: ['calendar-pricing'] });
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
              "min-w-[80px] w-[80px] h-20 border-r border-border/30 flex-shrink-0 p-2 cursor-pointer",
              "hover:bg-accent/10 transition-colors group relative",
              isWeekend && "bg-muted/20"
            )}
          >
            {showPricing && price && (
              <div className="text-xs font-medium text-foreground">${price}</div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Set Price</span>
            </div>
            <p className="text-xs text-muted-foreground">{format(parseISO(dateStr), 'MMM d, yyyy')}</p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Price"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                className="flex-1"
                min="0"
                step="1"
              />
              <Button size="sm" onClick={handleSavePrice} disabled={updatePricing.isPending}>
                {updatePricing.isPending ? '...' : 'Save'}
              </Button>
            </div>
            {price && (
              <p className="text-xs text-muted-foreground">Current: ${price}</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const PropertyRow = ({ property }: { property: Property }) => {
    const propertyImage = property.cover_image_url || property.featured_photos?.[0] || property.images?.[0];
    
    return (
      <div className="flex border-b border-border/30">
        {/* Property Info - Fixed Left Column */}
        <div className="w-64 flex-shrink-0 border-r border-border/30 p-3 bg-background sticky left-0 z-10">
          <div className="flex gap-3">
            <img 
              src={propertyImage || '/placeholder.svg'} 
              alt={property.title}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{property.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{property.location}</p>
            </div>
          </div>
        </div>

        {/* Calendar Cells - Scrollable */}
        <div className="flex flex-1">
          {calendarDays.map(day => {
            const booking = getBookingForCell(property.id, day.dateStr);
            const price = getPriceForCell(property.id, day.dateStr);
            const isCheckIn = booking && day.dateStr === booking.checkIn.slice(0, 10);
            const isLastDay = booking && addDays(parseISO(booking.checkOut), -1).toISOString().slice(0, 10) === day.dateStr;

            if (booking) {
              // Booking cell
              return (
                <Popover key={day.dateStr}>
                  <PopoverTrigger asChild>
                    <div 
                      className={cn(
                        "min-w-[80px] w-[80px] h-20 border-r border-border/30 flex-shrink-0 cursor-pointer relative",
                        getStatusColor(booking.sourcePlatform),
                        "hover:opacity-90 transition-opacity"
                      )}
                    >
                      {isCheckIn && (
                        <div className="absolute inset-0 p-2 text-white">
                          <div className="flex items-center gap-1 mb-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.guestName}`} />
                              <AvatarFallback className="text-[8px]">
                                {booking.guestName.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-medium truncate">{booking.guestName.split(' ')[0]}</span>
                            {getPlatformIcon(booking.sourcePlatform)}
                          </div>
                          {showLayers.pricing && price && (
                            <div className="text-[10px]">${price}</div>
                          )}
                          {showLayers.occupancy && (
                            <div className="flex items-center gap-0.5 text-[10px]">
                              <UsersIcon className="h-3 w-3" />
                              {booking.guestCount}
                            </div>
                          )}
                        </div>
                      )}
                      {isLastDay && (
                        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/80" />
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.guestName}`} />
                          <AvatarFallback>{booking.guestName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">{booking.guestName}</h4>
                          <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                        </div>
                        {booking.sourcePlatform && (
                          <Badge variant="outline" className="text-xs">
                            {booking.sourcePlatform}
                          </Badge>
                        )}
                      </div>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-in:</span>
                          <span className="font-medium">{format(parseISO(booking.checkIn), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-out:</span>
                          <span className="font-medium">{format(parseISO(booking.checkOut), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Guests:</span>
                          <span className="font-medium">{booking.guestCount}</span>
                        </div>
                        {booking.totalAmount && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium">${booking.totalAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nights:</span>
                          <span className="font-medium">
                            {differenceInDays(parseISO(booking.checkOut), parseISO(booking.checkIn))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            // Empty cell with pricing - editable
            return (
              <PriceEditCell
                key={day.dateStr}
                propertyId={property.id}
                dateStr={day.dateStr}
                price={price}
                isWeekend={day.isWeekend}
                showPricing={showLayers.pricing}
                onAddBooking={onAddBooking}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDays('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium min-w-[200px] text-center">
            {format(startDate, 'MMM d, yyyy')} - {format(addDays(startDate, daysToShow - 1), 'MMM d, yyyy')}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateDays('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync PriceLabs Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => syncPricing({})}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync PriceLabs'}
          </Button>

          {/* Property Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {selectedProperties.length > 0 ? `${selectedProperties.length} selected` : 'Filter properties'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Filter Properties</h4>
                  <Input
                    placeholder="Search properties..."
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="mb-3"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {properties.map(property => (
                    <div key={property.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${property.id}`}
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProperties(prev => [...prev, property.id]);
                          } else {
                            setSelectedProperties(prev => prev.filter(id => id !== property.id));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`property-${property.id}`} 
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {property.title}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedProperties.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedProperties([])}
                    className="w-full"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Layers Toggle */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <LayersIcon className="h-4 w-4" />
                Layers
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60" align="end">
              <div className="space-y-3">
                <h4 className="font-medium">Display Layers</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pricing"
                      checked={showLayers.pricing}
                      onCheckedChange={(checked) => 
                        setShowLayers(prev => ({ ...prev, pricing: !!checked }))
                      }
                    />
                    <label htmlFor="pricing" className="text-sm cursor-pointer">
                      Pricing
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="occupancy"
                      checked={showLayers.occupancy}
                      onCheckedChange={(checked) => 
                        setShowLayers(prev => ({ ...prev, occupancy: !!checked }))
                      }
                    />
                    <label htmlFor="occupancy" className="text-sm cursor-pointer">
                      Occupancy
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tasks"
                      checked={showLayers.tasks}
                      onCheckedChange={(checked) => 
                        setShowLayers(prev => ({ ...prev, tasks: !!checked }))
                      }
                    />
                    <label htmlFor="tasks" className="text-sm cursor-pointer">
                      Tasks
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Booking
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Date Header - Sticky */}
          <div className="flex border-b border-border sticky top-0 z-20 bg-background">
            <div className="w-64 flex-shrink-0 border-r border-border/30 p-3 font-medium text-sm sticky left-0 bg-background">
              Property name
            </div>
            <div ref={scrollRef} className="flex flex-1 overflow-x-auto">
              {calendarDays.map(day => (
                <div
                  key={day.dateStr}
                  className={cn(
                    "min-w-[80px] w-[80px] flex-shrink-0 border-r border-border/30 p-2 text-center",
                    day.isToday && "bg-primary/10",
                    day.isWeekend && "bg-muted/20"
                  )}
                >
                  <div className="text-[10px] text-muted-foreground uppercase">{day.dayOfWeek}</div>
                  <div className="text-sm font-semibold">{day.dayNumber}</div>
                  {day.dayNumber === 1 && (
                    <div className="text-[10px] text-muted-foreground">{day.monthAbbr}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Property Rows */}
          <div className="overflow-x-auto">
            {filteredProperties.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No properties found</p>
              </div>
            ) : (
              filteredProperties.map(property => (
                <PropertyRow key={property.id} property={property} />
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
