
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalContent: number;
  aiGeneratedContent: number;
  chatInteractions: number;
  contentViews: number;
  averageResponseTime: number;
  topPerformingContent: Array<{
    name: string;
    views: number;
    type: string;
  }>;
  contentByType: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    content: number;
    views: number;
  }>;
}

export const useAIAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalContent: 0,
    aiGeneratedContent: 0,
    chatInteractions: 0,
    contentViews: 0,
    averageResponseTime: 0,
    topPerformingContent: [],
    contentByType: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    console.log('Fetching AI analytics...');
    setLoading(true);
    try {
      // Fetch content statistics
      const { data: contentData, error: contentError } = await supabase
        .from('content_approval_items')
        .select('type, status, created_at');

      if (contentError) {
        console.error('Error fetching content data:', contentError);
      }

      // Fetch chat statistics
      const { data: chatData, error: chatError } = await supabase
        .from('chat_sessions')
        .select('id, created_at');

      if (chatError) {
        console.error('Error fetching chat data:', chatError);
      }

      // Fetch analytics metrics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('ai_analytics')
        .select('metric_type, metric_value, date');

      if (analyticsError) {
        console.error('Error fetching analytics data:', analyticsError);
      }

      // Process the data
      const totalContent = contentData?.length || 0;
      const aiGeneratedContent = contentData?.filter(item => item.status === 'approved').length || 0;
      const chatInteractions = chatData?.length || 0;

      // Generate monthly trends from content data
      const monthlyTrends = generateMonthlyTrends(contentData || []);

      // Generate content by type statistics
      const contentByType = generateContentByType(contentData || []);

      // For now, use computed values for other metrics
      // In a real implementation, these would come from actual usage tracking
      setAnalytics({
        totalContent,
        aiGeneratedContent,
        chatInteractions,
        contentViews: Math.floor(totalContent * 15.7), // Simulated average views per content
        averageResponseTime: 1.2, // This would come from actual AI response timing
        topPerformingContent: generateTopPerformingContent(contentData || []),
        contentByType,
        monthlyTrends
      });

    } catch (error) {
      console.error('Error in fetchAnalytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyTrends = (contentData: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      const monthData = contentData.filter(item => {
        const itemMonth = new Date(item.created_at).getMonth();
        return itemMonth === index;
      });
      return {
        month,
        content: monthData.length,
        views: Math.floor(monthData.length * 18.5) // Simulated views
      };
    });
  };

  const generateContentByType = (contentData: any[]) => {
    const typeCount = contentData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    const typeLabels = {
      blog_post: 'Blog Posts',
      property_description: 'Properties',
      page_content: 'Pages',
      ai_response: 'AI Responses'
    };

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

    return Object.entries(typeCount).map(([type, count], index) => ({
      name: typeLabels[type as keyof typeof typeLabels] || type,
      value: count as number,
      color: colors[index % colors.length]
    }));
  };

  const generateTopPerformingContent = (contentData: any[]) => {
    return contentData
      .filter(item => item.status === 'approved')
      .slice(0, 4)
      .map(item => ({
        name: item.title,
        views: Math.floor(Math.random() * 300) + 50, // Simulated views
        type: item.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      }));
  };

  const recordAnalyticsEvent = async (metricType: string, metricValue: any) => {
    try {
      const { error } = await supabase
        .from('ai_analytics')
        .insert({
          metric_type: metricType,
          metric_value: metricValue
        });

      if (error) {
        console.error('Error recording analytics event:', error);
      }
    } catch (error) {
      console.error('Error in recordAnalyticsEvent:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    recordAnalyticsEvent,
    refetch: fetchAnalytics
  };
};
