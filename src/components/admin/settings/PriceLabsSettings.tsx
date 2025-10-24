import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Link as LinkIcon } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  pricelabs_listing_id: string | null;
}

interface PriceLabsListing {
  id: string;
  name: string;
  nickname?: string;
}

export const PriceLabsSettings = () => {
  const queryClient = useQueryClient();
  const [priceLabsIds, setPriceLabsIds] = useState<Record<string, string>>({});
  const [priceLabsListings, setPriceLabsListings] = useState<PriceLabsListing[]>([]);

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

  const fetchPriceLabsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-pricelabs-listings');
      if (error) throw error;
      return data.listings as PriceLabsListing[];
    },
    onSuccess: (listings) => {
      setPriceLabsListings(listings);
      toast({
        title: 'Success',
        description: `Fetched ${listings.length} PriceLabs listings`
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to fetch PriceLabs listings: ${error.message}`,
        variant: 'destructive'
      });
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

  const handleSave = (propertyId: string, priceLabsId?: string) => {
    const idToSave = priceLabsId || priceLabsIds[propertyId] || '';
    updateMutation.mutate({
      propertyId,
      priceLabsId: idToSave
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
          Match your properties with PriceLabs listings to enable dynamic pricing sync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {priceLabsListings.length > 0 
              ? `${priceLabsListings.length} PriceLabs listings loaded` 
              : 'Load your PriceLabs listings to match with properties'}
          </p>
          <Button
            onClick={() => fetchPriceLabsMutation.mutate()}
            disabled={fetchPriceLabsMutation.isPending}
            variant="outline"
            size="sm"
          >
            {fetchPriceLabsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {priceLabsListings.length > 0 ? 'Refresh' : 'Load PriceLabs Listings'}
          </Button>
        </div>

        <div className="space-y-4">
          {properties?.map((property) => (
            <div key={property.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`pricelabs-${property.id}`} className="font-medium">
                  {property.title}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {property.pricelabs_listing_id 
                    ? `Mapped to: ${priceLabsListings.find(l => l.id === property.pricelabs_listing_id)?.name || property.pricelabs_listing_id}`
                    : 'Not mapped'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={priceLabsIds[property.id] || property.pricelabs_listing_id || ''}
                  onValueChange={(value) => {
                    setPriceLabsIds(prev => ({
                      ...prev,
                      [property.id]: value
                    }));
                    handleSave(property.id, value);
                  }}
                  disabled={priceLabsListings.length === 0}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select PriceLabs listing..." />
                  </SelectTrigger>
                  <SelectContent>
                    {priceLabsListings.map((listing) => (
                      <SelectItem key={listing.id} value={listing.id}>
                        {listing.name || listing.nickname || listing.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        {properties?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No properties found. Add properties first to configure PriceLabs integration.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
