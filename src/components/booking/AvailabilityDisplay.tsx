import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/property';
import { useAvailability, useDynamicPricing } from '@/hooks/useBookingData';
import { Calendar, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';

interface AvailabilityDisplayProps {
  property: Property;
  showPricing?: boolean;
  daysToShow?: number;
}

const AvailabilityDisplay = ({ 
  property, 
  showPricing = true, 
  daysToShow = 14 
}: AvailabilityDisplayProps) => {
  const today = startOfToday();
  const endDate = addDays(today, daysToShow);
  
  const { data: availability, isLoading: availabilityLoading } = useAvailability(
    property.id,
    { 
      start: format(today, 'yyyy-MM-dd'), 
      end: format(endDate, 'yyyy-MM-dd') 
    }
  );
  
  const { data: pricing, isLoading: pricingLoading } = useDynamicPricing(
    property.id,
    showPricing ? { 
      start: format(today, 'yyyy-MM-dd'), 
      end: format(endDate, 'yyyy-MM-dd') 
    } : undefined
  );

  const getAvailabilityStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const blocked = availability?.find(block => 
      dateStr >= block.start_date && dateStr <= block.end_date
    );
    
    if (blocked) {
      return {
        status: blocked.block_type as 'booked' | 'blocked' | 'maintenance' | 'owner_use',
        icon: blocked.block_type === 'booked' ? XCircle : Clock,
        color: blocked.block_type === 'booked' ? 'text-red-500' : 'text-yellow-500',
        bgColor: blocked.block_type === 'booked' ? 'bg-red-50' : 'bg-yellow-50',
        label: blocked.block_type === 'booked' ? 'Booked' : 
               blocked.block_type === 'maintenance' ? 'Maintenance' :
               blocked.block_type === 'owner_use' ? 'Owner Use' : 'Blocked'
      };
    }
    
    return {
      status: 'available' as const,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      label: 'Available'
    };
  };

  const getDayPrice = (date: Date) => {
    if (!showPricing || !pricing) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPricing = pricing.find(p => p.date === dateStr);
    return dayPricing?.final_price || property.price_per_night || 0;
  };

  const getAvailabilityStats = () => {
    const dates = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));
    const stats = dates.reduce((acc, date) => {
      const status = getAvailabilityStatus(date).status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      available: stats.available || 0,
      booked: stats.booked || 0,
      blocked: (stats.blocked || 0) + (stats.maintenance || 0) + (stats.owner_use || 0),
      total: daysToShow
    };
  };

  if (availabilityLoading || (showPricing && pricingLoading)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Loading availability...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getAvailabilityStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Availability Overview
        </CardTitle>
        <CardDescription>
          Next {daysToShow} days starting from {format(today, 'MMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Availability Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-green-700">Available</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.booked}</div>
            <div className="text-sm text-red-700">Booked</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.blocked}</div>
            <div className="text-sm text-yellow-700">Blocked</div>
          </div>
        </div>

        {/* Daily Availability */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Daily Availability</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {Array.from({ length: daysToShow }, (_, i) => {
              const date = addDays(today, i);
              const availability = getAvailabilityStatus(date);
              const price = getDayPrice(date);
              const isToday = isSameDay(date, today);
              
              return (
                <div 
                  key={date.toISOString()} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isToday ? 'bg-primary/5 border-primary/20' : 'bg-background'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <availability.icon className={`h-4 w-4 ${availability.color}`} />
                    <div>
                      <p className="font-medium text-sm">
                        {format(date, 'EEE, MMM d')}
                        {isToday && <Badge variant="outline" className="ml-2 text-xs">Today</Badge>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {showPricing && price && availability.status === 'available' && (
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">{price}</span>
                      </div>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${availability.bgColor} ${availability.color} border-current`}
                    >
                      {availability.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Legend</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-500" />
              <span>Blocked/Maintenance</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityDisplay;