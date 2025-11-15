import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SyncResult {
  propertyId: string;
  propertyName: string;
  success: boolean;
  reviewsFound?: number;
  reviewsImported?: number;
  error?: string;
}

const SyncAllPropertiesButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SyncResult[]>([]);
  const { toast } = useToast();

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-all-airbnb-reviews', {
        body: {}
      });

      if (error) throw error;

      setResults(data.results || []);
      setShowResults(true);

      toast({
        title: "Sync Complete",
        description: `${data.message}. Total reviews imported: ${data.totalReviewsImported}`,
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Airbnb reviews",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSyncAll}
        disabled={isSyncing}
        variant="default"
        size="sm"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing All Properties...' : 'Sync All Airbnb Reviews'}
      </Button>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sync Results</DialogTitle>
            <DialogDescription>
              Review sync results for all properties
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="font-medium">{result.propertyName}</div>
                {result.success ? (
                  <div className="text-sm text-muted-foreground mt-1">
                    Found {result.reviewsFound} reviews, imported {result.reviewsImported} new reviews
                  </div>
                ) : (
                  <div className="text-sm text-red-600 mt-1">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SyncAllPropertiesButton;
