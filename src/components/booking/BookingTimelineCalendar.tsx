import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Filter, ChevronLeft, ChevronRight, Calendar, DollarSign, Users, Home, Activity, Cloud, CloudOff, Clock } from 'lucide-react';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { useReservations, useExternalCalendars } from '@/hooks/useBookingData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, endOfWeek, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';

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
  cleaningStatus?: string;
  guestAvatar?: string;
  sourcePlatform?: string;
}

interface TimelineDay {
  date: Date;
  dayOfWeek: string;
  dayNumber: string;
  isToday: boolean;
  isWeekend: boolean;
}

interface BookingTimelineCalendarProps {
  onAddBooking?: (propertyId: string, date: string) => void;
}

export const BookingTimelineCalendar: React.FC<BookingTimelineCalendarProps> = ({
  onAddBooking
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showLayers, setShowLayers] = useState({
    occupancy: true,
    tasks: false,
    pricing: false
  });
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { properties = [] } = usePropertyFetch();
  
  // Get organization-scoped property IDs
  const propertyIds = useMemo(() => properties.map(p => p.id), [properties]);
  
  // Update hook call to include availability blocks as reservations
  const { data: allReservations = [] } = useReservations();
  
  // Fetch external calendar sync info for organization properties only
  const { data: externalCalendars = [] } = useExternalCalendars();
  
  // Fetch availability blocks for organization properties only
  const { data: availabilityBlocks = [] } = useQuery({
    queryKey: ['all-availability-blocks', propertyIds],
    queryFn: async () => {
      if (propertyIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('*')
        .in('property_id', propertyIds)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: propertyIds.length > 0
  });

  // Generate timeline days
  const timelineDays = useMemo(() => {
    const startDate = viewMode === 'week' 
      ? startOfWeek(currentWeek, { weekStartsOn: 1 })  // Start Monday
      : new Date(currentWeek.getFullYear(), currentWeek.getMonth(), 1);
    
    const endDate = viewMode === 'week'
      ? endOfWeek(currentWeek, { weekStartsOn: 1 })
      : new Date(currentWeek.getFullYear(), currentWeek.getMonth() + 1, 0);

    const days: TimelineDay[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push({
        date: new Date(currentDate),
        dayOfWeek: format(currentDate, 'EEE'),
        dayNumber: format(currentDate, 'd'),
        isToday: isSameDay(currentDate, new Date()),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
      });
      currentDate = addDays(currentDate, 1);
    }

    return days;
  }, [currentWeek, viewMode]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    if (selectedProperties.length === 0) return properties;
    return properties.filter(p => selectedProperties.includes(p.id));
  }, [properties, selectedProperties]);

  // Convert availability blocks (from synced external calendars) to booking blocks
  // Only show external calendar bookings, not direct reservations or "Blocked" sync entries
  const bookingBlocks = useMemo(() => {
    const availabilityBookingBlocks = availabilityBlocks
      .filter(block => 
        block.block_type === 'booked' && 
        // Exclude "Blocked" entries from VRBO which are just sync mirrors
        !(block.notes?.toLowerCase().startsWith('blocked'))
      )
      .map(block => ({
        id: `availability-${block.id}`,
        propertyId: block.property_id,
        guestName: block.notes || 'External Booking',
        guestEmail: block.external_booking_id || 'external@booking.com',
        checkIn: block.start_date,
        checkOut: block.end_date,
        guestCount: block.guest_count || 1,
        totalAmount: undefined,
        status: 'confirmed',
        cleaningStatus: undefined,
        guestAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${block.notes || 'External'}`,
        sourcePlatform: block.source_platform
      }));

    return availabilityBookingBlocks as BookingBlock[];
  }, [availabilityBlocks]);

  // Auto-jump to the nearest upcoming booking if current range has none
  const autoJumpedRef = useRef(false);
  useEffect(() => {
    if (autoJumpedRef.current) return;
    if (!bookingBlocks.length || !timelineDays.length) return;

    const rangeStartStr = format(timelineDays[0].date, 'yyyy-MM-dd');
    const rangeEndPlusOneStr = format(addDays(timelineDays[timelineDays.length - 1].date, 1), 'yyyy-MM-dd');

    const hasInRange = bookingBlocks.some(b => {
      const inStr = b.checkIn.slice(0, 10);
      const outStr = b.checkOut.slice(0, 10);
      return inStr < rangeEndPlusOneStr && outStr > rangeStartStr;
    });

    if (!hasInRange) {
      const earliestCheckInStr = bookingBlocks
        .map(b => b.checkIn.slice(0, 10))
        .sort()[0];
      if (earliestCheckInStr) {
        setCurrentWeek(new Date(earliestCheckInStr));
        autoJumpedRef.current = true;
      }
    }
  }, [bookingBlocks, timelineDays]);

  // Sync horizontal scroll between header and content
  useEffect(() => {
    const header = headerRef.current;
    const content = contentRef.current;
    if (!header || !content) return;

    const onContentScroll = () => {
      header.scrollLeft = content.scrollLeft;
    };
    const onHeaderScroll = () => {
      content.scrollLeft = header.scrollLeft;
    };

    content.addEventListener('scroll', onContentScroll);
    header.addEventListener('scroll', onHeaderScroll);
    return () => {
      content.removeEventListener('scroll', onContentScroll);
      header.removeEventListener('scroll', onHeaderScroll);
    };
  }, []);

  const getBookingForPropertyAndDate = (propertyId: string, date: Date) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    return bookingBlocks.find(booking => {
      if (booking.propertyId !== propertyId) return false;

      const checkInStr = booking.checkIn?.slice(0, 10);
      const checkOutStr = booking.checkOut?.slice(0, 10);

      if (!checkInStr || !checkOutStr) return false;

      // Compare as ISO date strings to avoid timezone issues
      return dayStr >= checkInStr && dayStr < checkOutStr; // inclusive of check-in, exclusive of check-out
    });
  };

  const getStatusColor = (status: string, sourcePlatform?: string) => {
    // Platform-based colors take priority
    if (sourcePlatform === 'airbnb') {
      return 'bg-red-500 hover:bg-red-600';
    }
    if (sourcePlatform === 'vrbo') {
      return 'bg-blue-500 hover:bg-blue-600';
    }
    if (sourcePlatform === 'direct') {
      return 'bg-emerald-500 hover:bg-emerald-600';
    }
    
    // Fallback to status-based colors for bookings without platform info
    switch (status) {
      case 'confirmed': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'pending': return 'bg-amber-500 hover:bg-amber-600';
      case 'cancelled': return 'bg-destructive hover:bg-destructive/90';
      case 'active': return 'bg-primary hover:bg-primary/90';
      case 'completed': return 'bg-muted-foreground hover:bg-muted-foreground/90';
      default: return 'bg-border hover:bg-border/80';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentWeek(newDate);
  };

  const handlePropertyFilter = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  // Calculate stats per property
  const getPropertyStats = (propertyId: string) => {
    const externalBookingCount = availabilityBlocks.filter(
      block => block.property_id === propertyId && block.block_type === 'booked'
    ).length;
    
    const directBookingCount = allReservations.filter(
      reservation => reservation.property_id === propertyId
    ).length;
    
    const propertyCalendars = externalCalendars.filter(
      cal => cal.property_id === propertyId && cal.sync_enabled
    );
    
    const lastSyncTime = propertyCalendars.length > 0
      ? propertyCalendars.reduce((latest, cal) => {
          const syncTime = cal.last_sync_at ? new Date(cal.last_sync_at) : new Date(0);
          return syncTime > latest ? syncTime : latest;
        }, new Date(0))
      : null;
    
    const syncStatus = propertyCalendars.length === 0 
      ? 'none' 
      : propertyCalendars.some(cal => cal.sync_status === 'failed')
      ? 'failed'
      : propertyCalendars.some(cal => cal.sync_status === 'syncing')
      ? 'syncing'
      : 'synced';
    
    return {
      externalBookingCount,
      directBookingCount,
      totalBookingCount: externalBookingCount + directBookingCount,
      lastSyncTime,
      syncStatus,
      hasExternalSync: propertyCalendars.length > 0
    };
  };

  const BookingBlockCell = ({ property, day }: { property: Property; day: TimelineDay }) => {
    const booking = getBookingForPropertyAndDate(property.id, day.date);
    
    if (!booking) {
      return (
        <div 
          className="h-24 min-w-[120px] w-[120px] flex-shrink-0 border-r border-border/30 hover:bg-accent/20 cursor-pointer relative group"
          onClick={() => onAddBooking?.(property.id, format(day.date, 'yyyy-MM-dd'))}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      );
    }

    const dayStr = format(day.date, 'yyyy-MM-dd');
    const isCheckInDay = dayStr === booking.checkIn.slice(0, 10);
    const isCheckOutDay = format(addDays(day.date, 1), 'yyyy-MM-dd') === booking.checkOut.slice(0, 10);
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className={cn(
            "h-24 min-w-[120px] w-[120px] flex-shrink-0 border-r border-border/30 cursor-pointer relative overflow-hidden",
            getStatusColor(booking.status, booking.sourcePlatform),
            "text-white"
          )}>
            <div className="absolute inset-0 p-1 flex flex-col justify-center">
              {isCheckInDay && (
                <div className="flex items-center gap-1 mb-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={booking.guestAvatar} />
                    <AvatarFallback className="text-xs">
                      {booking.guestName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium truncate">
                    {booking.guestName}
                  </span>
                </div>
              )}
              
              {showLayers.pricing && booking.totalAmount && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-xs">${booking.totalAmount}</span>
                </div>
              )}
              
              {showLayers.tasks && booking.cleaningStatus && (
                <Badge 
                  variant="secondary" 
                  className="text-xs h-4 w-fit"
                >
                  {booking.cleaningStatus}
                </Badge>
              )}
            </div>
            
            {/* Check-in indicator */}
            {isCheckInDay && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/80" />
            )}
            
            {/* Check-out indicator */}
            {isCheckOutDay && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/80" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={booking.guestAvatar} />
                <AvatarFallback>
                  {booking.guestName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{booking.guestName}</h4>
                <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{booking.guestCount} guests</span>
              </div>
              
              {booking.totalAmount && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">${booking.totalAmount}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <Badge variant="outline">{booking.status}</Badge>
                {booking.cleaningStatus && (
                  <Badge variant="secondary">{booking.cleaningStatus}</Badge>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Booking Calendar</CardTitle>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Layer Controls */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Layers
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-3">
                  <h4 className="font-medium">Display Layers</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="occupancy"
                        checked={showLayers.occupancy}
                        onCheckedChange={(checked) => 
                          setShowLayers(prev => ({ ...prev, occupancy: !!checked }))
                        }
                      />
                      <label htmlFor="occupancy" className="text-sm">Occupancy</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tasks"
                        checked={showLayers.tasks}
                        onCheckedChange={(checked) => 
                          setShowLayers(prev => ({ ...prev, tasks: !!checked }))
                        }
                      />
                      <label htmlFor="tasks" className="text-sm">Tasks</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pricing"
                        checked={showLayers.pricing}
                        onCheckedChange={(checked) => 
                          setShowLayers(prev => ({ ...prev, pricing: !!checked }))
                        }
                      />
                      <label htmlFor="pricing" className="text-sm">Pricing</label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Property Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Properties ({selectedProperties.length || 'All'})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-3">
                  <h4 className="font-medium">Filter Properties</h4>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {properties.map(property => (
                      <div key={property.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={property.id}
                          checked={selectedProperties.length === 0 || selectedProperties.includes(property.id)}
                          onCheckedChange={(checked) => handlePropertyFilter(property.id, !!checked)}
                        />
                        <label htmlFor={property.id} className="text-sm truncate">
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
                      Show All
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-semibold">
              {viewMode === 'week' 
                ? `${format(timelineDays[0]?.date || new Date(), 'MMM d')} - ${format(timelineDays[timelineDays.length - 1]?.date || new Date(), 'MMM d, yyyy')}`
                : format(currentWeek, 'MMMM yyyy')
              }
            </h3>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => setCurrentWeek(new Date())}>
            Today
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex h-[600px]">
          {/* Properties sidebar */}
          <div className="w-64 border-r bg-muted/30">
            <div className="h-16 border-b border-border/30 flex items-center px-4 bg-muted/50">
              <span className="font-medium text-sm">Properties</span>
            </div>
            
            <ScrollArea className="h-[calc(600px-64px)]">
              {filteredProperties.map(property => {
                const stats = getPropertyStats(property.id);
                
                return (
                  <div 
                    key={property.id}
                    className="h-24 py-4 border-b border-border/30 flex items-start gap-4 px-4 hover:bg-accent/20"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {(property.cover_image_url || property.image_url || (property.images && property.images.length > 0 ? property.images[0] : null)) ? (
                        <img
                          src={property.cover_image_url || property.image_url || (property.images && property.images.length > 0 ? property.images[0] : '')}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <Home className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">{property.title}</h4>
                        {stats.hasExternalSync && (
                          <div className="flex items-center gap-1">
                            {stats.syncStatus === 'synced' && (
                              <div title="Sync enabled">
                                <Cloud className="h-3 w-3 text-emerald-500" />
                              </div>
                            )}
                            {stats.syncStatus === 'failed' && (
                              <div title="Sync failed">
                                <CloudOff className="h-3 w-3 text-destructive" />
                              </div>
                            )}
                            {stats.syncStatus === 'syncing' && (
                              <div title="Syncing...">
                                <Cloud className="h-3 w-3 text-amber-500 animate-pulse" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{property.location}</span>
                        {stats.externalBookingCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {stats.externalBookingCount} ext
                            </span>
                          </>
                        )}
                        {stats.directBookingCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">
                              {stats.directBookingCount} direct
                            </span>
                          </>
                        )}
                      </div>
                      
                      {stats.lastSyncTime && stats.lastSyncTime.getTime() > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>
                            Last sync: {format(stats.lastSyncTime, 'MMM d, h:mm a')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </div>

          {/* Timeline grid */}
          <div className="flex-1 overflow-hidden">
            {/* Timeline header */}
            <div ref={headerRef} className="h-16 border-b border-border/30 bg-muted/50 overflow-x-auto">
              <div className="flex w-max">
                {timelineDays.map(day => (
                  <div 
                    key={day.date.toISOString()}
                    className={cn(
                      "min-w-[120px] w-[120px] flex-shrink-0 border-r border-border/30 flex flex-col items-center justify-center",
                      day.isToday && "bg-primary/10",
                      day.isWeekend && "bg-muted/80"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{day.dayOfWeek}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      day.isToday && "text-primary font-bold"
                    )}>
                      {day.dayNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline content */}
            <div ref={contentRef} className="h-[calc(600px-64px)] overflow-auto">
              {filteredProperties.map(property => (
                <div key={property.id} className="flex border-b border-border/30">
                  {timelineDays.map(day => (
                    <BookingBlockCell 
                      key={`${property.id}-${day.date.toISOString()}`}
                      property={property}
                      day={day}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};