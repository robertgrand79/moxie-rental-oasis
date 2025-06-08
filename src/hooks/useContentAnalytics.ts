
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContentInteraction {
  content_type: 'lifestyle' | 'event' | 'poi';
  content_id: string;
  action_type: 'view' | 'click' | 'external_link' | 'contact' | 'directions' | 'ticket' | 'website';
  user_session?: string;
  timestamp: string;
  metadata?: any;
}

export interface ContentPerformanceMetrics {
  content_id: string;
  content_type: string;
  title: string;
  total_interactions: number;
  views: number;
  clicks: number;
  engagement_rate: number;
  last_interaction: string;
  performance_score: number;
}

export const useContentAnalytics = () => {
  // Track content interactions with enhanced metadata
  const trackInteraction = useMutation({
    mutationFn: async (interaction: Omit<ContentInteraction, 'timestamp'>) => {
      const trackingData = {
        ...interaction,
        timestamp: new Date().toISOString(),
        user_session: sessionStorage.getItem('session_id') || 'anonymous',
        metadata: {
          ...interaction.metadata,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          page_url: window.location.href
        }
      };

      console.log('Content Interaction:', trackingData);
      
      const existingData = JSON.parse(localStorage.getItem('content_analytics') || '[]');
      existingData.push(trackingData);
      localStorage.setItem('content_analytics', JSON.stringify(existingData));

      return trackingData;
    }
  });

  // Get content performance metrics
  const getContentPerformance = useQuery({
    queryKey: ['content-performance'],
    queryFn: async (): Promise<ContentPerformanceMetrics[]> => {
      const analyticsData = JSON.parse(localStorage.getItem('content_analytics') || '[]');
      
      // Group interactions by content
      const contentGroups = analyticsData.reduce((acc: any, interaction: ContentInteraction) => {
        const key = `${interaction.content_type}-${interaction.content_id}`;
        if (!acc[key]) {
          acc[key] = {
            content_id: interaction.content_id,
            content_type: interaction.content_type,
            interactions: [],
            views: 0,
            clicks: 0
          };
        }
        
        acc[key].interactions.push(interaction);
        
        if (interaction.action_type === 'view') {
          acc[key].views++;
        } else if (['click', 'external_link', 'contact', 'directions', 'ticket', 'website'].includes(interaction.action_type)) {
          acc[key].clicks++;
        }
        
        return acc;
      }, {});

      // Calculate performance metrics for each content item
      return Object.values(contentGroups).map((group: any) => {
        const totalInteractions = group.interactions.length;
        const engagementRate = group.views > 0 ? (group.clicks / group.views) * 100 : 0;
        
        // Performance score based on views, engagement rate, and recency
        const recentInteractions = group.interactions.filter((i: ContentInteraction) => 
          new Date(i.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        const performanceScore = Math.min(100, 
          (group.views * 0.3) + 
          (engagementRate * 0.4) + 
          (recentInteractions * 0.3)
        );

        const lastInteraction = group.interactions
          .sort((a: ContentInteraction, b: ContentInteraction) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];

        return {
          content_id: group.content_id,
          content_type: group.content_type,
          title: `${group.content_type} ${group.content_id}`, // Will be enhanced with actual titles
          total_interactions: totalInteractions,
          views: group.views,
          clicks: group.clicks,
          engagement_rate: Math.round(engagementRate * 100) / 100,
          last_interaction: lastInteraction?.timestamp || '',
          performance_score: Math.round(performanceScore * 100) / 100
        };
      }).sort((a, b) => b.performance_score - a.performance_score);
    },
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  // Get time-based analytics
  const getTimeBasedAnalytics = useQuery({
    queryKey: ['time-analytics'],
    queryFn: async () => {
      const analyticsData = JSON.parse(localStorage.getItem('content_analytics') || '[]');
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const filterByTimeRange = (data: ContentInteraction[], startDate: Date) =>
        data.filter(item => new Date(item.timestamp) > startDate);

      const getHourlyData = (data: ContentInteraction[]) => {
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, interactions: 0 }));
        data.forEach(item => {
          const hour = new Date(item.timestamp).getHours();
          hourlyData[hour].interactions++;
        });
        return hourlyData;
      };

      return {
        last24Hours: {
          total: filterByTimeRange(analyticsData, last24Hours).length,
          hourly: getHourlyData(filterByTimeRange(analyticsData, last24Hours))
        },
        last7Days: {
          total: filterByTimeRange(analyticsData, last7Days).length,
          byType: filterByTimeRange(analyticsData, last7Days).reduce((acc: any, item) => {
            acc[item.content_type] = (acc[item.content_type] || 0) + 1;
            return acc;
          }, {})
        },
        last30Days: {
          total: filterByTimeRange(analyticsData, last30Days).length,
          trend: [] // Could add daily breakdown here
        }
      };
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Get popular content with enhanced metrics
  const getPopularContent = useQuery({
    queryKey: ['popular-content'],
    queryFn: async () => {
      const analyticsData = JSON.parse(localStorage.getItem('content_analytics') || '[]');
      
      const contentCounts = analyticsData.reduce((acc: any, interaction: ContentInteraction) => {
        const key = `${interaction.content_type}-${interaction.content_id}`;
        if (!acc[key]) {
          acc[key] = { 
            type: interaction.content_type, 
            id: interaction.content_id, 
            interactions: 0,
            views: 0,
            clicks: 0,
            unique_sessions: new Set()
          };
        }
        acc[key].interactions++;
        acc[key].unique_sessions.add(interaction.user_session);
        
        if (interaction.action_type === 'view') {
          acc[key].views++;
        } else if (['click', 'external_link', 'contact', 'directions', 'ticket', 'website'].includes(interaction.action_type)) {
          acc[key].clicks++;
        }
        
        return acc;
      }, {});

      return Object.values(contentCounts)
        .map((item: any) => ({
          ...item,
          unique_sessions: item.unique_sessions.size,
          engagement_rate: item.views > 0 ? (item.clicks / item.views) * 100 : 0
        }))
        .sort((a: any, b: any) => b.interactions - a.interactions)
        .slice(0, 10);
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    trackInteraction,
    getContentPerformance,
    getTimeBasedAnalytics,
    getPopularContent
  };
};
