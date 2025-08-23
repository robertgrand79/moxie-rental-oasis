import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAirbnbSync } from '@/hooks/useAirbnbSync';
import { Property } from '@/types/property';

const AirbnbSyncManager = () => {
  const { syncMetadata, isLoadingSyncData, syncReviews, isSyncing } = useAirbnbSync();

  // Fetch properties with Airbnb URLs
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['properties-with-airbnb'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, airbnb_listing_url')
        .not('airbnb_listing_url', 'is', null)
        .order('title');
      
      if (error) throw error;
      return data as Property[];
    }
  });

  const handleSync = (propertyId: string) => {
    syncReviews.mutate(propertyId);
  };

  const getSyncStatus = (propertyId: string) => {
    return syncMetadata.find(sync => sync.property_id === propertyId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoadingProperties || isLoadingSyncData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Airbnb Reviews Sync
          </CardTitle>
          <CardDescription>
            Automatically import reviews from your Airbnb listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading properties...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Airbnb Reviews Sync
        </CardTitle>
        <CardDescription>
          Automatically import reviews from your Airbnb listings. New reviews will be added as pending testimonials for approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No properties with Airbnb URLs configured.</p>
            <p className="text-sm mt-2">Add Airbnb listing URLs to your properties to enable review syncing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => {
              const syncStatus = getSyncStatus(property.id);
              const isCurrentlySyncing = isSyncing && syncReviews.variables === property.id;
              
              return (
                <div key={property.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{property.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {property.airbnb_listing_url}
                      </p>
                      
                      {syncStatus && (
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getStatusColor(syncStatus.sync_status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(syncStatus.sync_status)}
                              {syncStatus.sync_status}
                            </div>
                          </Badge>
                          
                          {syncStatus.last_sync_at && (
                            <span className="text-xs text-muted-foreground">
                              Last sync: {new Date(syncStatus.last_sync_at).toLocaleDateString()}
                            </span>
                          )}
                          
                          {syncStatus.new_reviews_imported !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              Imported: {syncStatus.new_reviews_imported} / {syncStatus.total_reviews_found}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {syncStatus?.error_message && (
                        <p className="text-sm text-destructive mt-1">
                          Error: {syncStatus.error_message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleSync(property.id)}
                      disabled={isCurrentlySyncing}
                      size="sm"
                    >
                      {isCurrentlySyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="ml-2">
                        {isCurrentlySyncing ? 'Syncing...' : 'Sync Reviews'}
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AirbnbSyncManager;