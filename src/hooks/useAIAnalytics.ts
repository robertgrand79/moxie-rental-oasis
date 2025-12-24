import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import type { Json } from '@/integrations/supabase/types';

// Internal types for analytics processing
interface AssistantMessage {
  conversation_id: string;
  role: string;
  created_at: string;
}

interface ContentItem {
  id?: string;
  title?: string;
  type?: string;
  created_at?: string;
  status?: string;
}

interface PageView {
  content_id?: string;
  page_path?: string;
  content_type?: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  message_count?: number;
  created_at?: string;
}

export interface AnalyticsData {
  totalContent: number;
  aiGeneratedContent: number;
  chatInteractions: number;
  totalConversations: number;
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
    chats: number;
  }>;
}

export const useAIAnalytics = () => {
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalContent: 0,
    aiGeneratedContent: 0,
    chatInteractions: 0,
    totalConversations: 0,
    contentViews: 0,
    averageResponseTime: 0,
    topPerformingContent: [],
    contentByType: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    console.log('Fetching AI analytics for organization:', organization.id);
    setLoading(true);
    try {
      // Fetch real page views - ORGANIZATION SCOPED
      const { data: pageViewsData, error: pageViewsError } = await supabase
        .from('page_views')
        .select('id, page_path, content_type, content_id, created_at')
        .eq('organization_id', organization.id);

      if (pageViewsError) {
        console.error('Error fetching page views:', pageViewsError);
      }

      // Fetch real content statistics with organization filter
      const { data: contentData, error: contentError } = await supabase
        .from('content_approval_items')
        .select('type, status, created_at, title');

      if (contentError) {
        console.error('Error fetching content data:', contentError);
      }

      // Fetch blog posts for content stats - ORGANIZATION SCOPED
      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, status, created_at, title')
        .eq('organization_id', organization.id);

      if (blogError) {
        console.error('Error fetching blog data:', blogError);
      }

      // Fetch properties for content stats - ORGANIZATION SCOPED
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, created_at, title')
        .eq('organization_id', organization.id);

      if (propertiesError) {
        console.error('Error fetching properties data:', propertiesError);
      }

      // Fetch chat conversations with created_at for trends - ORGANIZATION SCOPED
      const { data: chatData, error: chatError } = await supabase
        .from('assistant_conversations')
        .select('id, message_count, created_at')
        .eq('organization_id', organization.id);

      if (chatError) {
        console.error('Error fetching chat data:', chatError);
      }

      // Fetch messages to calculate real response times - join with conversations for org scope
      const conversationIds = chatData?.map(c => c.id) || [];
      let messagesData: AssistantMessage[] = [];
      
      if (conversationIds.length > 0) {
        const { data: messages, error: messagesError } = await supabase
          .from('assistant_messages')
          .select('conversation_id, role, created_at')
          .in('conversation_id', conversationIds)
          .order('created_at');

        if (messagesError) {
          console.error('Error fetching messages data:', messagesError);
        } else {
          messagesData = messages || [];
        }
      }

      // Process the real data with fallbacks
      const allContent = [
        ...(contentData || []),
        ...(blogData || []),
        ...(propertiesData || [])
      ];

      const totalContent = allContent.length;
      const aiGeneratedContent = contentData?.filter(item => item.status === 'approved').length || 0;
      
      // Real chat interactions count (total messages)
      const chatInteractions = chatData?.reduce((sum, chat) => sum + (chat.message_count || 0), 0) || 0;
      
      // Total unique conversations
      const totalConversations = chatData?.length || 0;

      // Calculate real average response time from message timestamps
      const averageResponseTime = calculateAverageResponseTime(messagesData);

      // Real page views count
      const contentViews = pageViewsData?.length || 0;

      // Generate monthly trends from real data including chats
      const monthlyTrends = generateMonthlyTrends(allContent, pageViewsData || [], chatData || []);

      // Generate content by type statistics from real data
      const contentByType = generateContentByType(contentData || [], blogData || [], propertiesData || []);

      // Generate top performing content from real page views
      const topPerformingContent = generateTopPerformingContent(allContent, pageViewsData || []);

      const analyticsData = {
        totalContent,
        aiGeneratedContent,
        chatInteractions,
        totalConversations,
        contentViews,
        averageResponseTime,
        topPerformingContent,
        contentByType,
        monthlyTrends
      };

      console.log('Analytics data processed for organization:', organization.id, analyticsData);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error in fetchAnalytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [organization?.id]);

  // Calculate average response time from user->assistant message pairs
  const calculateAverageResponseTime = (messages: AssistantMessage[]) => {
    if (!messages || messages.length < 2) return 0;

    // Group messages by conversation
    const byConversation: Record<string, AssistantMessage[]> = {};
    messages.forEach(msg => {
      if (!byConversation[msg.conversation_id]) {
        byConversation[msg.conversation_id] = [];
      }
      byConversation[msg.conversation_id].push(msg);
    });

    let totalTime = 0;
    let pairs = 0;

    Object.values(byConversation).forEach(convMessages => {
      // Sort by created_at within each conversation
      convMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      for (let i = 0; i < convMessages.length - 1; i++) {
        if (convMessages[i].role === 'user' && convMessages[i + 1].role === 'assistant') {
          const userTime = new Date(convMessages[i].created_at).getTime();
          const assistantTime = new Date(convMessages[i + 1].created_at).getTime();
          const responseTime = (assistantTime - userTime) / 1000; // Convert to seconds
          
          // Only count reasonable response times (< 60 seconds)
          if (responseTime > 0 && responseTime < 60) {
            totalTime += responseTime;
            pairs++;
          }
        }
      }
    });

    return pairs > 0 ? parseFloat((totalTime / pairs).toFixed(1)) : 0;
  };

  const generateMonthlyTrends = (allContent: ContentItem[], pageViews: PageView[], conversations: Conversation[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Get last 6 months
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push({ name: months[monthIndex], index: monthIndex });
    }

    return last6Months.map(({ name, index }) => {
      const contentCount = allContent.filter(item => {
        if (!item.created_at) return false;
        const date = new Date(item.created_at);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      }).length;

      const viewsCount = pageViews.filter(view => {
        if (!view.created_at) return false;
        const date = new Date(view.created_at);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      }).length;

      const chatsCount = conversations.filter(conv => {
        if (!conv.created_at) return false;
        const date = new Date(conv.created_at);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      }).length;

      return {
        month: name,
        content: contentCount,
        views: viewsCount,
        chats: chatsCount
      };
    });
  };

  const generateContentByType = (contentData: ContentItem[], blogData: ContentItem[], propertiesData: ContentItem[]) => {
    const contentTypes = [
      { name: 'AI Content', value: contentData.length, color: '#3b82f6' },
      { name: 'Blog Posts', value: blogData.length, color: '#10b981' },
      { name: 'Properties', value: propertiesData.length, color: '#f59e0b' },
    ];

    return contentTypes.filter(type => type.value > 0);
  };

  const generateTopPerformingContent = (allContent: ContentItem[], pageViews: PageView[]) => {
    // Count views per content path/id
    const viewCounts: Record<string, { count: number; path: string; type: string }> = {};
    
    pageViews.forEach(view => {
      const key = view.content_id || view.page_path;
      if (!viewCounts[key]) {
        viewCounts[key] = { 
          count: 0, 
          path: view.page_path,
          type: view.content_type || 'Page'
        };
      }
      viewCounts[key].count++;
    });

    // Sort by count and get top 4
    const sorted = Object.entries(viewCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 4);

    if (sorted.length > 0) {
      return sorted.map(([key, data]) => {
        // Try to find matching content title
        const content = allContent.find(c => c.id === key);
        return {
          name: content?.title || data.path,
          views: data.count,
          type: data.type
        };
      });
    }

    // Fallback to content without views if no page views yet
    return allContent.slice(0, 4).map(item => ({
      name: item.title || 'Untitled Content',
      views: 0,
      type: item.type || 'Content'
    }));
  };

  const recordAnalyticsEvent = async (metricType: string, metricValue: Json) => {
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
    if (!orgLoading && organization?.id) {
      fetchAnalytics();
    }
  }, [orgLoading, organization?.id, fetchAnalytics]);

  return {
    analytics,
    loading: loading || orgLoading,
    recordAnalyticsEvent,
    refetch: fetchAnalytics
  };
};
