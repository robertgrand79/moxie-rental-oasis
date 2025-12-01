import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Link as LinkIcon, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  const syncMutation = useMutation({
    mutationFn: async (propertyIds?: string[]) => {
      const { data, error } = await supabase.functions.invoke('sync-pricelabs-pricing', {
        body: { property_ids: propertyIds }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties-pricelabs'] });
      const successCount = data?.results?.filter((r: any) => r.success)?.length || 0;
      const totalCount = data?.results?.length || 0;
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${successCount}/${totalCount} properties`
      });
    },
    onError: (error) => {
      toast({
        title: 'Sync Failed',
        description: error.message,
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

  const handleSyncAll = () => {
    const mappedPropertyIds = properties?.filter(p => p.pricelabs_listing_id)?.map(p => p.id);
    if (!mappedPropertyIds?.length) {
      toast({
        title: 'No Properties to Sync',
        description: 'Map at least one property to a PriceLabs listing first',
        variant: 'destructive'
      });
      return;
    }
    syncMutation.mutate(mappedPropertyIds);
  };

  const handleSyncProperty = (propertyId: string) => {
    syncMutation.mutate([propertyId]);
  };

  const mappedCount = properties?.filter(p => p.pricelabs_listing_id)?.length || 0;
  const unmappedCount = (properties?.length || 0) - mappedCount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            PriceLabs Overview
          </CardTitle>
          <CardDescription>
            Connect your properties to PriceLabs listings for automated dynamic pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-success/20 text-success hover:bg-success/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {mappedCount} Mapped
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                {unmappedCount} Unmapped
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => fetchPriceLabsMutation.mutate()}
              disabled={fetchPriceLabsMutation.isPending}
              variant="outline"
            >
              {fetchPriceLabsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {priceLabsListings.length > 0 ? 'Refresh Listings' : 'Load PriceLabs Listings'}
            </Button>

            <Button
              onClick={handleSyncAll}
              disabled={syncMutation.isPending || mappedCount === 0}
            >
              {syncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Sync All Prices ({mappedCount})
            </Button>
          </div>

          {priceLabsListings.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              {priceLabsListings.length} PriceLabs listings loaded
            </p>
          )}
        </CardContent>
      </Card>

      {/* Property Mapping List */}
      <Card>
        <CardHeader>
          <CardTitle>Property Mappings</CardTitle>
          <CardDescription>
            Select a PriceLabs listing for each property to enable price syncing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {properties?.map((property) => {
            const isMapped = !!property.pricelabs_listing_id;
            const mappedListing = priceLabsListings.find(l => l.id === property.pricelabs_listing_id);
            
            return (
              <div 
                key={property.id} 
                className={`flex items-center gap-4 p-4 border rounded-lg ${
                  isMapped ? 'border-success/30 bg-success/5' : 'border-border'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isMapped ? (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <Label className="font-medium truncate">
                      {property.title}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {isMapped 
                      ? `Mapped to: ${mappedListing?.name || property.pricelabs_listing_id}`
                      : 'Not mapped'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select
                    value={priceLabsIds[property.id] || property.pricelabs_listing_id || 'none'}
                    onValueChange={(value) => {
                      const newValue = value === 'none' ? '' : value;
                      setPriceLabsIds(prev => ({
                        ...prev,
                        [property.id]: newValue
                      }));
                      handleSave(property.id, newValue);
                    }}
                    disabled={priceLabsListings.length === 0}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select listing..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">None</span>
                      </SelectItem>
                      {priceLabsListings.map((listing) => (
                        <SelectItem key={listing.id} value={listing.id}>
                          {listing.name || listing.nickname || listing.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {isMapped && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSyncProperty(property.id)}
                      disabled={syncMutation.isPending}
                    >
                      {syncMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {properties?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No properties found. Add properties first to configure PriceLabs integration.
            </p>
          )}

          {priceLabsListings.length === 0 && properties && properties.length > 0 && (
            <div className="text-center py-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Load your PriceLabs listings to start mapping properties
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
                Load PriceLabs Listings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
