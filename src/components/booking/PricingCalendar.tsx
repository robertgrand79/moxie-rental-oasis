import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDynamicPricing, useUpdatePricing } from '@/hooks/useBookingData';
import { PricingCalendarProps } from '@/types/booking';
import { format, parseISO, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export const PricingCalendar: React.FC<PricingCalendarProps> = ({
  propertyId,
  onPriceUpdate,
  readOnly = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [priceInput, setPriceInput] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dateRange = {
    start: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
    end: format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd')
  };

  const { data: pricingData, isLoading } = useDynamicPricing(propertyId, dateRange);
  const updatePricing = useUpdatePricing();

  const getPriceForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return pricingData?.find(p => p.date === dateStr);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || readOnly) return;
    
    setSelectedDate(date);
    const pricing = getPriceForDate(date);
    setPriceInput(pricing?.final_price?.toString() || '');
  };

  const handlePriceUpdate = async () => {
    if (!selectedDate || !priceInput) return;

    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await updatePricing.mutateAsync({
        property_id: propertyId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        base_price: 0, // Will be updated by the system
        manual_override_price: price,
        final_price: price,
        pricing_source: 'manual'
      });

      toast.success('Price updated successfully');
      onPriceUpdate?.(format(selectedDate, 'yyyy-MM-dd'), price);
      setSelectedDate(undefined);
      setPriceInput('');
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  const renderDay = (date: Date) => {
    const pricing = getPriceForDate(date);
    const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

    return (
      <div className={`relative p-1 ${isSelected ? 'bg-primary text-primary-foreground rounded' : ''}`}>
        <div className="text-sm">{format(date, 'd')}</div>
        {pricing && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <Badge 
              variant={pricing.pricing_source === 'manual' ? 'default' : 'secondary'} 
              className="text-xs px-1 py-0 h-4"
            >
              ${pricing.final_price}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const getPricingStats = () => {
    if (!pricingData?.length) return null;

    const prices = pricingData.map(p => p.final_price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return { avgPrice, minPrice, maxPrice };
  };

  const stats = getPricingStats();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Calendar
        </CardTitle>
        {stats && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Min: ${stats.minPrice}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Max: ${stats.maxPrice}
            </div>
            <div>Avg: ${stats.avgPrice.toFixed(0)}</div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            components={{
              Day: ({ date }) => renderDay(date)
            }}
            className="rounded-md border"
            disabled={readOnly}
          />

          {selectedDate && !readOnly && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">
                Update Price for {format(selectedDate, 'MMM dd, yyyy')}
              </h3>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
                <Button 
                  onClick={handlePriceUpdate}
                  disabled={updatePricing.isPending || !priceInput}
                >
                  {updatePricing.isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>

              {getPriceForDate(selectedDate) && (
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Current Price:</span>
                    <span>${getPriceForDate(selectedDate)?.final_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <Badge variant="outline" className="capitalize">
                      {getPriceForDate(selectedDate)?.pricing_source}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 text-xs">
            <Badge variant="default">Manual Override</Badge>
            <Badge variant="secondary">Dynamic/Base Price</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};