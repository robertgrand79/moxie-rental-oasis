import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from 'date-fns';

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
        .select('date, final_price, base_price, pricelabs_price, pricing_source')
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

  const selectedProperty = properties?.find(p => p.id === selectedPropertyId);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!pricing?.length) return null;
    const prices = pricing.map(p => p.final_price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const fromPriceLabs = pricing.filter(p => p.pricelabs_price !== null).length;
    return { min, max, avg, fromPriceLabs, total: pricing.length };
  }, [pricing]);

  return (
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
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
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
                <div key={`empty-${i}`} className="h-20 border-b border-r bg-muted/20" />
              ))}
              
              {/* Days of month */}
              {daysInMonth.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayPrice = priceMap.get(dateStr);
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                const hasPriceLabsData = dayPrice?.pricelabs_price !== null;
                
                return (
                  <div
                    key={dateStr}
                    className={`h-20 border-b border-r p-1.5 flex flex-col ${
                      isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                    }`}
                  >
                    <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayPrice ? (
                      <div className="flex-1 flex flex-col justify-center items-center">
                        <span className={`text-lg font-bold ${
                          hasPriceLabsData ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          ${dayPrice.final_price}
                        </span>
                        {hasPriceLabsData && (
                          <span className="text-[10px] text-primary/70 font-medium">PL</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">—</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Empty cells to fill remaining row */}
              {Array.from({ length: (7 - ((startDayOfWeek + daysInMonth.length) % 7)) % 7 }).map((_, i) => (
                <div key={`empty-end-${i}`} className="h-20 border-b border-r bg-muted/20" />
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>PriceLabs synced</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted-foreground/50" />
            <span>Fallback/base price</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
