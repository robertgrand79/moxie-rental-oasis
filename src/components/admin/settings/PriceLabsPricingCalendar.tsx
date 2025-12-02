import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, Loader2, Clock, LogIn, LogOut, Info, TrendingUp, TrendingDown, DollarSign, X } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isWeekend } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { invalidateAllPricingQueries } from '@/utils/pricingCacheUtils';

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
  min_price_limit: number | null;
  max_price_limit: number | null;
  manual_override_price: number | null;
}

export const PriceLabsPricingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [overridePrice, setOverridePrice] = useState<string>('');
  const queryClient = useQueryClient();

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
        .select('date, final_price, base_price, pricelabs_price, pricing_source, min_stay, checkin_allowed, checkout_allowed, currency, last_synced_at, min_price_limit, max_price_limit, manual_override_price')
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

  // Mutation for saving manual price override
  const saveOverride = useMutation({
    mutationFn: async ({ date, price }: { date: string; price: number }) => {
      const { error } = await supabase
        .from('dynamic_pricing')
        .upsert({
          property_id: selectedPropertyId,
          date,
          base_price: priceMap.get(date)?.base_price || price,
          final_price: price,
          manual_override_price: price,
          pricing_source: 'manual'
        }, {
          onConflict: 'property_id,date'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Price override saved');
      invalidateAllPricingQueries(queryClient);
      setSelectedDate(null);
      setOverridePrice('');
    },
    onError: () => {
      toast.error('Failed to save price override');
    }
  });

  // Mutation for clearing manual override
  const clearOverride = useMutation({
    mutationFn: async (date: string) => {
      const existingPrice = priceMap.get(date);
      if (!existingPrice) return;
      
      const { error } = await supabase
        .from('dynamic_pricing')
        .update({
          manual_override_price: null,
          final_price: existingPrice.pricelabs_price || existingPrice.base_price,
          pricing_source: existingPrice.pricelabs_price ? 'pricelabs_variation' : 'base'
        })
        .eq('property_id', selectedPropertyId)
        .eq('date', date);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Override cleared');
      invalidateAllPricingQueries(queryClient);
      setSelectedDate(null);
      setOverridePrice('');
    },
    onError: () => {
      toast.error('Failed to clear override');
    }
  });

  const handleDayClick = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setOverridePrice('');
    } else {
      setSelectedDate(dateStr);
      const dayPrice = priceMap.get(dateStr);
      setOverridePrice(dayPrice?.manual_override_price?.toString() || dayPrice?.final_price?.toString() || '');
    }
  };

  const handleSaveOverride = () => {
    if (!selectedDate || !overridePrice) return;
    const price = parseFloat(overridePrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    saveOverride.mutate({ date: selectedDate, price });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  // Calculate stats including min/max price limits
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
    
    // Get min/max price limits from first record (they're the same for all days)
    const firstWithLimits = pricing.find(p => p.min_price_limit !== null);
    const minPriceLimit = firstWithLimits?.min_price_limit || null;
    const maxPriceLimit = firstWithLimits?.max_price_limit || null;
    
    // Check pricing source
    const pricingSources = new Set(pricing.map(p => p.pricing_source));
    const hasPartnerApiAccess = pricingSources.has('pricelabs_daily');
    const usingVariation = pricingSources.has('pricelabs_variation');
    
    return { 
      min, max, avg, fromPriceLabs, total: pricing.length, 
      withMinStay, withRestrictions, lastSync,
      minPriceLimit, maxPriceLimit, hasPartnerApiAccess, usingVariation
    };
  }, [pricing]);

  // Check if a day is weekend (Fri/Sat - premium nights)
  const isPremiumNight = (date: Date) => {
    const day = date.getDay();
    return day === 5 || day === 6;
  };

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

          {/* API Status Banner */}
          {stats && !stats.hasPartnerApiAccess && (
            <Alert className="mt-4 border-amber-200 bg-amber-50">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Using Estimated Pricing</AlertTitle>
              <AlertDescription className="text-amber-700 text-sm">
                Daily pricing requires PriceLabs Partner API access (pending approval). 
                Currently using weekend/weekday price variation based on your min/max settings
                {stats.minPriceLimit && stats.maxPriceLimit && (
                  <span className="font-medium"> (${stats.minPriceLimit} - ${stats.maxPriceLimit})</span>
                )}.
              </AlertDescription>
            </Alert>
          )}

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
              <div className="bg-muted px-3 py-1.5 rounded flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-muted-foreground">Min:</span>{' '}
                <span className="font-semibold">${stats.min}</span>
              </div>
              <div className="bg-muted px-3 py-1.5 rounded flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-rose-600" />
                <span className="text-muted-foreground">Max:</span>{' '}
                <span className="font-semibold">${stats.max}</span>
              </div>
              <div className="bg-muted px-3 py-1.5 rounded">
                <span className="text-muted-foreground">Avg:</span>{' '}
                <span className="font-semibold">${Math.round(stats.avg)}</span>
              </div>
              
              {/* Price limits from PriceLabs */}
              {stats.minPriceLimit && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded">
                  <span className="text-blue-600">PL Range:</span>{' '}
                  <span className="font-semibold">${stats.minPriceLimit} - ${stats.maxPriceLimit || '∞'}</span>
                </div>
              )}
              
              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded">
                <span className="font-semibold">{stats.fromPriceLabs}/{stats.total}</span>{' '}
                <span className="text-muted-foreground">synced</span>
              </div>
              
              {stats.usingVariation && !stats.hasPartnerApiAccess && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Weekend/Weekday Variation
                </Badge>
              )}
              
              {stats.hasPartnerApiAccess && (
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Partner API Active
                </Badge>
              )}
              
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
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div 
                    key={day} 
                    className={`px-2 py-2 text-center text-xs font-medium border-b ${
                      i === 5 || i === 6 ? 'text-primary bg-primary/5' : 'text-muted-foreground'
                    }`}
                  >
                    {day}
                    {(i === 5 || i === 6) && <span className="ml-1 text-[10px]">↑</span>}
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
                  const isPremium = isPremiumNight(day);
                  const isManualOverride = dayPrice?.pricing_source === 'manual';
                  const isSelected = selectedDate === dateStr;
                  
                  return (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleDayClick(dateStr)}
                          className={`h-24 border-b border-r p-1.5 flex flex-col cursor-pointer transition-colors hover:bg-muted/50 ${
                            isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                          } ${noCheckin || noCheckout ? 'bg-rose-50' : ''} ${
                            isPremium && !noCheckin && !noCheckout ? 'bg-amber-50/50' : ''
                          } ${isManualOverride ? 'bg-green-50 border-green-200' : ''} ${
                            isSelected ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                              {format(day, 'd')}
                            </span>
                            {isPremium && hasPriceLabsData && (
                              <TrendingUp className="h-2.5 w-2.5 text-amber-500" />
                            )}
                          </div>
                          
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
                              {!hasMinStay && !noCheckin && !noCheckout && (
                                  <span className={`text-[10px] font-medium ${isManualOverride ? 'text-green-600' : 'text-primary/70'}`}>
                                    {isManualOverride ? '✓ Manual' : dayPrice.pricing_source === 'pricelabs_daily' ? 'PL' : '~'}
                                  </span>
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
                            {dayPrice.min_price_limit && (
                              <div className="text-blue-600">
                                PL Range: ${dayPrice.min_price_limit} - ${dayPrice.max_price_limit || '∞'}
                              </div>
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
                              Source: {
                                dayPrice.pricing_source === 'pricelabs_daily' ? 'PriceLabs Daily' :
                                dayPrice.pricing_source === 'pricelabs_variation' ? 'PriceLabs (Estimated)' :
                                'Fallback'
                              }
                              {isPremium && ' • Weekend Premium'}
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

          {/* Manual Override Panel */}
          {selectedDate && (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Set Price for {format(new Date(selectedDate + 'T12:00:00'), 'MMM d, yyyy')}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedDate(null); setOverridePrice(''); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={overridePrice}
                    onChange={(e) => setOverridePrice(e.target.value)}
                    step="1"
                    min="0"
                  />
                </div>
                <Button 
                  onClick={handleSaveOverride}
                  disabled={saveOverride.isPending || !overridePrice}
                >
                  {saveOverride.isPending ? 'Saving...' : 'Save'}
                </Button>
                {priceMap.get(selectedDate)?.pricing_source === 'manual' && (
                  <Button 
                    variant="outline"
                    onClick={() => clearOverride.mutate(selectedDate)}
                    disabled={clearOverride.isPending}
                  >
                    Clear Override
                  </Button>
                )}
              </div>
              
              {priceMap.get(selectedDate) && (
                <div className="text-sm text-muted-foreground">
                  Current: ${priceMap.get(selectedDate)?.final_price} 
                  ({priceMap.get(selectedDate)?.pricing_source === 'manual' ? 'Manual Override' : 'Synced'})
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
              <span>Manual override</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>PriceLabs synced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-primary font-medium">~</span>
              <span>Estimated (weekend/weekday)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              <span>Weekend premium</span>
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