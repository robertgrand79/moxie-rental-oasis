import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAirbnbSync } from '@/hooks/useAirbnbSync';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface AirbnbReviewSyncProps {
  propertyId: string;
  airbnbUrl: string;
}

const AirbnbReviewSync = ({ propertyId, airbnbUrl }: AirbnbReviewSyncProps) => {
  const { syncReviews, isSyncing } = useAirbnbSync();
  const [lastSync, setLastSync] = useState<any>(null);

  useEffect(() => {
    loadSyncStatus();
  }, [propertyId]);

  const loadSyncStatus = async () => {
    const { data } = await supabase
      .from('airbnb_sync_log')
      .select('*')
      .eq('property_id', propertyId)
      .order('last_sync_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setLastSync(data);
    }
  };

  const handleSync = async () => {
    const result = await syncReviews(propertyId, airbnbUrl);
    if (result) {
      loadSyncStatus();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        size="sm"
        variant="outline"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync Airbnb Reviews'}
      </Button>

      {lastSync && (
        <Badge variant={lastSync.sync_status === 'completed' ? 'default' : 'secondary'}>
          {lastSync.reviews_imported} reviews • {formatDistanceToNow(new Date(lastSync.last_sync_at))} ago
        </Badge>
      )}
    </div>
  );
};

export default AirbnbReviewSync;
