import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  pricelabs_listing_id: string | null;
}

export const PriceLabsSettings = () => {
  const queryClient = useQueryClient();
  const [priceLabsIds, setPriceLabsIds] = useState<Record<string, string>>({});

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties-pricelabs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, pricelabs_listing_id')
        .order('title');
      
      if (error) throw error;
      
      // Initialize state with existing values
      const initialIds: Record<string, string> = {};
      data?.forEach(prop => {
        if (prop.pricelabs_listing_id) {
          initialIds[prop.id] = prop.pricelabs_listing_id;
        }
      });
      setPriceLabsIds(initialIds);
      
      return data as Property[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ propertyId, priceLabsId }: { propertyId: string; priceLabsId: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ pricelabs_listing_id: priceLabsId || null })
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties-pricelabs'] });
      toast({
        title: 'Success',
        description: 'PriceLabs listing ID updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const handleSave = (propertyId: string) => {
    updateMutation.mutate({
      propertyId,
      priceLabsId: priceLabsIds[propertyId] || ''
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PriceLabs Integration</CardTitle>
        <CardDescription>
          Map each property to its PriceLabs listing ID to enable dynamic pricing sync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {properties?.map((property) => (
          <div key={property.id} className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor={`pricelabs-${property.id}`}>
                {property.title}
              </Label>
              <Input
                id={`pricelabs-${property.id}`}
                placeholder="PriceLabs Listing ID"
                value={priceLabsIds[property.id] || ''}
                onChange={(e) => setPriceLabsIds(prev => ({
                  ...prev,
                  [property.id]: e.target.value
                }))}
              />
            </div>
            <Button
              onClick={() => handleSave(property.id)}
              disabled={updateMutation.isPending}
              size="sm"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
