import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyPriceLabsMappingProps {
  property: Property;
}

interface PriceLabsListing {
  id: string;
  name: string;
  nickname?: string;
}

export const PropertyPriceLabsMapping: React.FC<PropertyPriceLabsMappingProps> = ({ property }) => {
  const queryClient = useQueryClient();
  const [priceLabsListings, setPriceLabsListings] = useState<PriceLabsListing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>(property.pricelabs_listing_id || '');

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
    mutationFn: async (priceLabsId: string) => {
      const { error } = await supabase
        .from('properties')
        .update({ pricelabs_listing_id: priceLabsId === 'none' ? null : priceLabsId })
        .eq('id', property.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Success',
        description: 'PriceLabs listing mapped successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update mapping: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const handleMappingChange = (value: string) => {
    setSelectedListingId(value);
    updateMutation.mutate(value);
  };

  const currentMapping = priceLabsListings.find(l => l.id === property.pricelabs_listing_id);

  // Prevent any events from bubbling up to the parent form
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card onClick={handleContainerClick} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          PriceLabs Integration
        </CardTitle>
        <CardDescription>
          Connect this property to a PriceLabs listing for dynamic pricing sync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {priceLabsListings.length > 0 
              ? `${priceLabsListings.length} PriceLabs listings available` 
              : 'Load your PriceLabs listings to map this property'}
          </p>
          <Button
            type="button"
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
            {priceLabsListings.length > 0 ? 'Refresh Listings' : 'Load PriceLabs Listings'}
          </Button>
        </div>

        {property.pricelabs_listing_id && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <div className="flex-1">
              <p className="text-sm font-medium">Mapped to PriceLabs</p>
              <p className="text-xs text-muted-foreground">
                {currentMapping?.name || currentMapping?.nickname || property.pricelabs_listing_id}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="pricelabs-listing">PriceLabs Listing</Label>
          <Select
            value={selectedListingId || 'none'}
            onValueChange={handleMappingChange}
            disabled={priceLabsListings.length === 0 || updateMutation.isPending}
          >
            <SelectTrigger id="pricelabs-listing">
              <SelectValue placeholder="Select PriceLabs listing..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-muted-foreground">None (Remove mapping)</span>
              </SelectItem>
              {priceLabsListings.map((listing) => (
                <SelectItem key={listing.id} value={listing.id}>
                  {listing.name || listing.nickname || listing.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {priceLabsListings.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Click "Load PriceLabs Listings" to see available listings
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
