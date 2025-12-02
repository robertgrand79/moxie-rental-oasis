import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, Loader2, Clock, LogIn, LogOut } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Property {
  id: string;
  title: string;
  pricelabs_listing_id: string | null;
}

interface DailyPrice {
  date: string;
  final_price: number;
  base_price: number;
  pricelabs_price: number | null;
  pricing_source: string;
  min_stay: number | null;
  checkin_allowed: boolean;
  checkout_allowed: boolean;
  currency: string;
  last_synced_at: string | null;
}

export const PriceLabsPricingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // Fetch properties with PriceLabs mapping
  const { data: properties } = useQuery({
    queryKey: ['properties-with-pricelabs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, pricelabs_listing_id')
        .not('pricelabs_listing_id', 'is', null)
        .order('title');
      
      if (error) throw error;
      return data as Property[];
    }
  });

  // Auto-select first property if none selected
  React.useEffect(() => {
    if (properties?.length && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  // Fetch pricing for selected property and month
  const { data: pricing, isLoading: pricingLoading } = useQuery({
    queryKey: ['pricelabs-pricing-calendar', selectedPropertyId, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('dynamic_pricing')
        .select('date, final_price, base_price, pricelabs_price, pricing_source, min_stay, checkin_allowed, checkout_allowed, currency, last_synced_at')
        .eq('property_id', selectedPropertyId)
        .gte('date', start)
        .lte('date', end)
        .order('date');
      
      if (error) throw error;
      return data as DailyPrice[];
    },
    enabled: !!selectedPropertyId
  });

  const priceMap = React.useMemo(() => {
    const map = new Map<string, DailyPrice>();
    pricing?.forEach(p => map.set(p.date, p));
    return map;
  }, [pricing]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!pricing?.length) return null;
    const prices = pricing.map(p => p.final_price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const fromPriceLabs = pricing.filter(p => p.pricelabs_price !== null).length;
    const withMinStay = pricing.filter(p => p.min_stay && p.min_stay > 1).length;
    const withRestrictions = pricing.filter(p => !p.checkin_allowed || !p.checkout_allowed).length;
    const lastSync = pricing.find(p => p.last_synced_at)?.last_synced_at;
    return { min, max, avg, fromPriceLabs, total: pricing.length, withMinStay, withRestrictions, lastSync };
  }, [pricing]);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pricing Calendar
            </CardTitle>
            
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select property..." />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap gap-3 mt-4 text-sm">
              <div className="bg-muted px-3 py-1.5 rounded">
                <span className="text-muted-foreground">Min:</span>{' '}
                <span className="font-semibold">${stats.min}</span>
              </div>
              <div className="bg-muted px-3 py-1.5 rounded">
                <span className="text-muted-foreground">Max:</span>{' '}
                <span className="font-semibold">${stats.max}</span>
              </div>
              <div className="bg-muted px-3 py-1.5 rounded">
                <span className="text-muted-foreground">Avg:</span>{' '}
                <span className="font-semibold">${Math.round(stats.avg)}</span>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded">
                <span className="font-semibold">{stats.fromPriceLabs}/{stats.total}</span>{' '}
                <span className="text-muted-foreground">from PriceLabs</span>
              </div>
              {stats.withMinStay > 0 && (
                <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-semibold">{stats.withMinStay}</span>{' '}
                  <span>with min stay</span>
                </div>
              )}
              {stats.withRestrictions > 0 && (
                <div className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded">
                  <span className="font-semibold">{stats.withRestrictions}</span>{' '}
                  <span>with restrictions</span>
                </div>
              )}
            </div>
          )}

          {/* Last sync timestamp */}
          {stats?.lastSync && (
            <div className="text-xs text-muted-foreground mt-2">
              Last synced: {format(new Date(stats.lastSync), 'MMM d, yyyy h:mm a')}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {!selectedPropertyId ? (
            <p className="text-muted-foreground text-center py-8">
              No properties with PriceLabs mapping found. Map a property first.
            </p>
          ) : pricingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-muted/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground border-b">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 border-b border-r bg-muted/20" />
                ))}
                
                {/* Days of month */}
                {daysInMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayPrice = priceMap.get(dateStr);
                  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                  const hasPriceLabsData = dayPrice?.pricelabs_price !== null;
                  const hasMinStay = dayPrice?.min_stay && dayPrice.min_stay > 1;
                  const noCheckin = dayPrice?.checkin_allowed === false;
                  const noCheckout = dayPrice?.checkout_allowed === false;
                  
                  return (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-24 border-b border-r p-1.5 flex flex-col cursor-default ${
                            isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                          } ${noCheckin || noCheckout ? 'bg-rose-50' : ''}`}
                        >
                          <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                            {format(day, 'd')}
                          </span>
                          
                          {dayPrice ? (
                            <div className="flex-1 flex flex-col justify-center items-center gap-0.5">
                              <span className={`text-lg font-bold ${
                                hasPriceLabsData ? 'text-primary' : 'text-muted-foreground'
                              }`}>
                                ${dayPrice.final_price}
                              </span>
                              
                              {/* Min stay indicator */}
                              {hasMinStay && (
                                <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  {dayPrice.min_stay}n
                                </span>
                              )}
                              
                              {/* Check-in/out restrictions */}
                              <div className="flex items-center gap-1">
                                {hasPriceLabsData && !hasMinStay && !noCheckin && !noCheckout && (
                                  <span className="text-[10px] text-primary/70 font-medium">PL</span>
                                )}
                                {noCheckin && (
                                  <span className="text-[10px] text-rose-500 flex items-center">
                                    <LogIn className="h-2.5 w-2.5" />
                                    <span className="line-through">in</span>
                                  </span>
                                )}
                                {noCheckout && (
                                  <span className="text-[10px] text-rose-500 flex items-center">
                                    <LogOut className="h-2.5 w-2.5" />
                                    <span className="line-through">out</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">—</span>
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      {dayPrice && (
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="text-sm space-y-1">
                            <div className="font-semibold">{format(day, 'EEEE, MMM d, yyyy')}</div>
                            <div>Price: <span className="font-medium">${dayPrice.final_price} {dayPrice.currency}</span></div>
                            {dayPrice.base_price !== dayPrice.final_price && (
                              <div className="text-muted-foreground">Base: ${dayPrice.base_price}</div>
                            )}
                            {hasMinStay && (
                              <div className="text-amber-600">Min Stay: {dayPrice.min_stay} nights</div>
                            )}
                            {noCheckin && (
                              <div className="text-rose-600">No check-in allowed</div>
                            )}
                            {noCheckout && (
                              <div className="text-rose-600">No check-out allowed</div>
                            )}
                            <div className="text-muted-foreground text-xs">
                              Source: {hasPriceLabsData ? 'PriceLabs' : 'Fallback'}
                            </div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
                
                {/* Empty cells to fill remaining row */}
                {Array.from({ length: (7 - ((startDayOfWeek + daysInMonth.length) % 7)) % 7 }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="h-24 border-b border-r bg-muted/20" />
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>PriceLabs synced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-muted-foreground/50" />
              <span>Fallback price</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-amber-600" />
              <span>Min stay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LogIn className="h-3 w-3 text-rose-500" />
              <span>No check-in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LogOut className="h-3 w-3 text-rose-500" />
              <span>No check-out</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
