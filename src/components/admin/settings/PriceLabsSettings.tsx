import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, CheckCircle2, XCircle, DollarSign, Home, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Property {
  id: string;
  title: string;
  pricelabs_listing_id: string | null;
  hospitable_property_id: string | null;
}

interface PriceLabsListing {
  id: string;
  name: string;
  nickname?: string;
}

export const PriceLabsSettings = () => {
  const queryClient = useQueryClient();
  const [priceLabsIds, setPriceLabsIds] = useState<Record<string, string>>({});
  const [hospitableIds, setHospitableIds] = useState<Record<string, string>>({});
  const [priceLabsListings, setPriceLabsListings] = useState<PriceLabsListing[]>([]);

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties-pricelabs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, pricelabs_listing_id, hospitable_property_id')
        .order('title');
      
      if (error) throw error;
      
      const initialPriceLabsIds: Record<string, string> = {};
      const initialHospitableIds: Record<string, string> = {};
      data?.forEach(prop => {
        if (prop.pricelabs_listing_id) {
          initialPriceLabsIds[prop.id] = prop.pricelabs_listing_id;
        }
        if (prop.hospitable_property_id) {
          initialHospitableIds[prop.id] = prop.hospitable_property_id;
        }
      });
      setPriceLabsIds(initialPriceLabsIds);
      setHospitableIds(initialHospitableIds);
      
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

  const updateHospitableMutation = useMutation({
    mutationFn: async ({ propertyId, hospitableId }: { propertyId: string; hospitableId: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ hospitable_property_id: hospitableId || null })
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties-pricelabs'] });
      toast({
        title: 'Success',
        description: 'Hospitable property ID updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update Hospitable ID: ${error.message}`,
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

  // Hospitable sync mutation
  const hospitableSyncMutation = useMutation({
    mutationFn: async (propertyIds?: string[]) => {
      const { data, error } = await supabase.functions.invoke('sync-hospitable-pricing', {
        body: { property_ids: propertyIds }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties-pricelabs'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-pricing'] });
      const successCount = data?.results?.filter((r: any) => r.success)?.length || 0;
      const totalCount = data?.results?.length || 0;
      const totalPrices = data?.total_prices_updated || 0;
      toast({
        title: 'Hospitable Sync Complete',
        description: `Synced ${successCount}/${totalCount} properties (${totalPrices} prices)`
      });
    },
    onError: (error) => {
      toast({
        title: 'Hospitable Sync Failed',
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

  const handleSaveHospitableId = (propertyId: string) => {
    const hospitableId = hospitableIds[propertyId] || '';
    updateHospitableMutation.mutate({
      propertyId,
      hospitableId
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

  const handleHospitableSyncAll = () => {
    const hospitablePropertyIds = properties?.filter(p => p.hospitable_property_id)?.map(p => p.id);
    if (!hospitablePropertyIds?.length) {
      toast({
        title: 'No Properties to Sync',
        description: 'No properties have Hospitable IDs configured',
        variant: 'destructive'
      });
      return;
    }
    hospitableSyncMutation.mutate(hospitablePropertyIds);
  };

  const handleSyncProperty = (propertyId: string) => {
    syncMutation.mutate([propertyId]);
  };

  const handleHospitableSyncProperty = (propertyId: string) => {
    hospitableSyncMutation.mutate([propertyId]);
  };

  const mappedCount = properties?.filter(p => p.pricelabs_listing_id)?.length || 0;
  const unmappedCount = (properties?.length || 0) - mappedCount;
  const hospitableMappedCount = properties?.filter(p => p.hospitable_property_id)?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hospitable Sync Card - Primary pricing source */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Hospitable Pricing Sync
          </CardTitle>
          <CardDescription>
            Sync dynamic pricing from Hospitable (receives prices from PriceLabs)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="default" className="bg-success/20 text-success hover:bg-success/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {hospitableMappedCount} Properties with Hospitable ID
            </Badge>
          </div>

          <Button
            onClick={handleHospitableSyncAll}
            disabled={hospitableSyncMutation.isPending || hospitableMappedCount === 0}
          >
            {hospitableSyncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Prices from Hospitable ({hospitableMappedCount})
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            This fetches daily prices from Hospitable calendar for the next 365 days
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* PriceLabs Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            PriceLabs Mapping (Future Direct Integration)
          </CardTitle>
          <CardDescription>
            Map properties to PriceLabs listings for future direct API access
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
              variant="outline"
            >
              {syncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Sync from PriceLabs ({mappedCount})
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
            Configure Hospitable and PriceLabs IDs for each property. Find your Hospitable ID in the URL: app.hospitable.com/properties/<strong>YOUR_ID</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {properties?.map((property) => {
            const isPriceLabsMapped = !!property.pricelabs_listing_id;
            const isHospitableMapped = !!property.hospitable_property_id;
            const mappedListing = priceLabsListings.find(l => l.id === property.pricelabs_listing_id);
            const currentHospitableId = hospitableIds[property.id] ?? property.hospitable_property_id ?? '';
            const hasHospitableChanges = currentHospitableId !== (property.hospitable_property_id || '');
            
            return (
              <div 
                key={property.id} 
                className={`p-4 border rounded-lg space-y-3 ${
                  isHospitableMapped ? 'border-success/30 bg-success/5' : 'border-border'
                }`}
              >
                {/* Property Title */}
                <div className="flex items-center gap-2">
                  {isHospitableMapped ? (
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <Label className="font-medium">
                    {property.title}
                  </Label>
                </div>

                {/* Hospitable ID Row */}
                <div className="flex items-center gap-2 ml-6">
                  <Label className="text-sm text-muted-foreground w-24 flex-shrink-0">Hospitable:</Label>
                  <Input
                    placeholder="Enter Hospitable Property ID"
                    value={currentHospitableId}
                    onChange={(e) => setHospitableIds(prev => ({
                      ...prev,
                      [property.id]: e.target.value
                    }))}
                    className="flex-1 max-w-[300px]"
                  />
                  <Button
                    size="sm"
                    variant={hasHospitableChanges ? "default" : "outline"}
                    onClick={() => handleSaveHospitableId(property.id)}
                    disabled={updateHospitableMutation.isPending || !hasHospitableChanges}
                  >
                    {updateHospitableMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  {isHospitableMapped && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleHospitableSyncProperty(property.id)}
                      disabled={hospitableSyncMutation.isPending}
                      title="Sync from Hospitable"
                    >
                      {hospitableSyncMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Home className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* PriceLabs Row */}
                <div className="flex items-center gap-2 ml-6">
                  <Label className="text-sm text-muted-foreground w-24 flex-shrink-0">PriceLabs:</Label>
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
                    <SelectTrigger className="flex-1 max-w-[300px]">
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
                  {isPriceLabsMapped && (
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

                {/* Status Text */}
                <p className="text-xs text-muted-foreground ml-6">
                  {isHospitableMapped 
                    ? `Hospitable ID: ${property.hospitable_property_id}`
                    : 'No Hospitable ID configured'}
                  {isPriceLabsMapped && ` • PriceLabs: ${mappedListing?.name || property.pricelabs_listing_id}`}
                </p>
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
