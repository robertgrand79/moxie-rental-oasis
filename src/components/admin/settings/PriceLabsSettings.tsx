import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PriceLabsPricingCalendar } from './PriceLabsPricingCalendar';

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

const CACHE_KEY = 'pricelabs_listings_cache';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

const getCachedListings = (): PriceLabsListing[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { listings, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return listings;
  } catch {
    return null;
  }
};

const setCachedListings = (listings: PriceLabsListing[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ listings, timestamp: Date.now() }));
  } catch {
    // Ignore storage errors
  }
};

export const PriceLabsSettings = () => {
  const queryClient = useQueryClient();
  const [priceLabsIds, setPriceLabsIds] = useState<Record<string, string>>({});
  const [priceLabsListings, setPriceLabsListings] = useState<PriceLabsListing[]>(() => getCachedListings() || []);
  const { organization } = useCurrentOrganization();

  // Get organization-scoped properties
  const { properties: orgProperties, loading: propertiesLoading } = usePropertyFetch();
  
  // Transform properties to the expected format and set initial priceLabsIds
  const properties = React.useMemo(() => {
    const props = (orgProperties || []).map(p => ({
      id: p.id,
      title: p.title,
      pricelabs_listing_id: p.pricelabs_listing_id || null
    })) as Property[];
    
    const initialPriceLabsIds: Record<string, string> = {};
    props.forEach(prop => {
      if (prop.pricelabs_listing_id) {
        initialPriceLabsIds[prop.id] = prop.pricelabs_listing_id;
      }
    });
    setPriceLabsIds(prev => {
      // Only update if there are changes to avoid infinite loops
      const hasChanges = Object.keys(initialPriceLabsIds).length !== Object.keys(prev).length ||
        Object.keys(initialPriceLabsIds).some(k => initialPriceLabsIds[k] !== prev[k]);
      return hasChanges ? initialPriceLabsIds : prev;
    });
    
    return props;
  }, [orgProperties]);

  const isLoading = propertiesLoading;

  const fetchPriceLabsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-pricelabs-listings', {
        body: { organization_id: organization?.id }
      });
      if (error) throw error;
      return data.listings as PriceLabsListing[];
    },
    onSuccess: (listings) => {
      setPriceLabsListings(listings);
      setCachedListings(listings);
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

  // Auto-load listings on mount if not cached
  useEffect(() => {
    if (priceLabsListings.length === 0) {
      fetchPriceLabsMutation.mutate();
    }
  }, []);

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
      {/* Pricing Calendar */}
      <PriceLabsPricingCalendar />

      {/* PriceLabs Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            PriceLabs Integration
          </CardTitle>
          <CardDescription>
            Map properties to PriceLabs listings for dynamic pricing sync
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
              Sync Pricing ({mappedCount})
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
            Select which PriceLabs listing corresponds to each property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {properties?.map((property) => {
            const isMapped = !!property.pricelabs_listing_id;
            const mappedListing = priceLabsListings.find(l => l.id === property.pricelabs_listing_id);
            
            return (
              <div 
                key={property.id} 
                className={`p-4 border rounded-lg ${
                  isMapped ? 'border-success/30 bg-success/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    {isMapped ? (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <Label className="font-medium">
                      {property.title}
                    </Label>
                  </div>

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
                    <SelectTrigger className="w-[300px]">
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

                {isMapped && (
                  <p className="text-sm text-muted-foreground mt-2 ml-6">
                    {mappedListing 
                      ? `Linked to: ${mappedListing.name || mappedListing.nickname}`
                      : `Mapped ID: ${property.pricelabs_listing_id}`
                    }
                  </p>
                )}
              </div>
            );
          })}

          {(!properties || properties.length === 0) && (
            <p className="text-muted-foreground text-center py-8">
              No properties found. Add properties first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
