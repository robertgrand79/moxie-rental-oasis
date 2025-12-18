import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  success: boolean;
  reviewsFound: number;
  reviewsImported: number;
  message: string;
  averageRating?: number;
  totalReviews?: number;
}

type ScraperType = 'apify' | 'firecrawl';

export const useAirbnbSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const syncReviews = async (
    propertyId: string, 
    airbnbUrl?: string,
    scraper: ScraperType = 'firecrawl'
  ): Promise<SyncResult | null> => {
    if (isSyncing) {
      toast({
        title: "Sync in progress",
        description: "Please wait for the current sync to complete",
        variant: "default",
      });
      return null;
    }

    setIsSyncing(true);

    const functionName = scraper === 'firecrawl' 
      ? 'scrape-airbnb-firecrawl' 
      : 'scrape-airbnb-reviews';

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { propertyId, airbnbUrl },
      });

      if (error) throw error;

      toast({
        title: "Sync complete",
        description: data.message || `Imported ${data.reviewsImported} new reviews`,
      });

      return data;
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync Airbnb reviews",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  return { syncReviews, isSyncing };
};
