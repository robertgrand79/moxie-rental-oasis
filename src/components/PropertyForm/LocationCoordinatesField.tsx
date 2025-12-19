import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PropertyFormData } from './types';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationCoordinatesFieldProps {
  form: UseFormReturn<PropertyFormData>;
  disabled?: boolean;
}

const LocationCoordinatesField = ({ form, disabled = false }: LocationCoordinatesFieldProps) => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();
  
  const handleGeocode = async () => {
    const location = form.getValues('location');
    
    if (!location || location.trim() === '') {
      toast({
        title: 'Address required',
        description: 'Please enter a property address first.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGeocoding(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address: location },
      });
      
      if (error) throw error;
      
      if (data?.latitude && data?.longitude) {
        form.setValue('latitude', data.latitude);
        form.setValue('longitude', data.longitude);
        
        toast({
          title: 'Coordinates found',
          description: `Location: ${data.placeName || location}`,
        });
      } else {
        toast({
          title: 'Could not geocode address',
          description: 'Please check the address or enter coordinates manually.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: 'Geocoding failed',
        description: 'Unable to get coordinates. Please try again or enter manually.',
        variant: 'destructive',
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const hasCoordinates = form.watch('latitude') && form.watch('longitude');

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-medium">Location Coordinates</h4>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleGeocode}
          disabled={disabled || isGeocoding}
        >
          {isGeocoding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Geocoding...
            </>
          ) : hasCoordinates ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Update Coordinates
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Get Coordinates
            </>
          )}
        </Button>
      </div>
      
      <FormDescription>
        Coordinates are used to display the property on maps. Click "Get Coordinates" to auto-detect from the address, or enter manually.
      </FormDescription>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="any"
                  placeholder="e.g. 44.0521"
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="any"
                  placeholder="e.g. -123.0868"
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default LocationCoordinatesField;
