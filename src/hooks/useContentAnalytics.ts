
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContentInteraction {
  content_type: 'lifestyle' | 'event' | 'poi';
  content_id: string;
  action_type: 'view' | 'click' | 'external_link' | 'contact' | 'directions';
  user_session?: string;
  timestamp: string;
  metadata?: any;
}

export const useContentAnalytics = () => {
  // Track content interactions
  const trackInteraction = useMutation({
    mutationFn: async (interaction: Omit<ContentInteraction, 'timestamp'>) => {
      const trackingData = {
        ...interaction,
        timestamp: new Date().toISOString(),
        user_session: sessionStorage.getItem('session_id') || 'anonymous'
      };

      // For now, we'll log to console and store in localStorage
      // In a real implementation, this would go to an analytics table
      console.log('Content Interaction:', trackingData);
      
      const existingData = JSON.parse(localStorage.getItem('content_analytics') || '[]');
      existingData.push(trackingData);
      localStorage.setItem('content_analytics', JSON.stringify(existingData));

      return trackingData;
    }
  });

  // Get popular content (placeholder implementation)
  const getPopularContent = useQuery({
    queryKey: ['popular-content'],
    queryFn: async () => {
      const analyticsData = JSON.parse(localStorage.getItem('content_analytics') || '[]');
      
      // Group by content and count interactions
      const contentCounts = analyticsData.reduce((acc: any, interaction: ContentInteraction) => {
        const key = `${interaction.content_type}-${interaction.content_id}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Convert to array and sort by popularity
      const popularContent = Object.entries(contentCounts)
        .map(([key, count]) => {
          const [type, id] = key.split('-');
          return { type, id, interactions: count };
        })
        .sort((a: any, b: any) => b.interactions - a.interactions)
        .slice(0, 10);

      return popularContent;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Get content performance metrics
  const getContentMetrics = useQuery({
    queryKey: ['content-metrics'],
    queryFn: async () => {
      const analyticsData = JSON.parse(localStorage.getItem('content_analytics') || '[]');
      
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recent24h = analyticsData.filter((item: ContentInteraction) => 
        new Date(item.timestamp) > last24Hours
      );
      const recent7d = analyticsData.filter((item: ContentInteraction) => 
        new Date(item.timestamp) > last7Days
      );

      return {
        total_interactions: analyticsData.length,
        interactions_24h: recent24h.length,
        interactions_7d: recent7d.length,
        by_type: {
          lifestyle: analyticsData.filter((i: ContentInteraction) => i.content_type === 'lifestyle').length,
          events: analyticsData.filter((i: ContentInteraction) => i.content_type === 'event').length,
          poi: analyticsData.filter((i: ContentInteraction) => i.content_type === 'poi').length
        },
        by_action: analyticsData.reduce((acc: any, item: ContentInteraction) => {
          acc[item.action_type] = (acc[item.action_type] || 0) + 1;
          return acc;
        }, {})
      };
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    trackInteraction,
    getPopularContent,
    getContentMetrics
  };
};
