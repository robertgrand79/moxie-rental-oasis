import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Eye, MousePointer, BarChart3, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useAIAnalytics } from '@/hooks/useAIAnalytics';
import { useContentAnalytics } from '@/hooks/useContentAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

const ContentPerformanceTab = () => {
  const { analytics: aiAnalytics, loading: aiLoading, refetch: refetchAI } = useAIAnalytics();
  const { 
    data: contentPerformance, 
    isLoading: contentLoading,
    refetch: refetchContent 
  } = useContentAnalytics().getContentPerformance;
  
  const { 
    data: timeBasedAnalytics, 
    isLoading: timeLoading,
    refetch: refetchTime 
  } = useContentAnalytics().getTimeBasedAnalytics;

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      refetchAI();
      refetchContent();
      refetchTime();
    };

    window.addEventListener('resetContentAnalytics', handleReset);
    return () => window.removeEventListener('resetContentAnalytics', handleReset);
  }, [refetchAI, refetchContent, refetchTime]);

  const handleRefresh = () => {
    refetchAI();
    refetchContent();
    refetchTime();
  };

  if (aiLoading || contentLoading || timeLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalViews = contentPerformance?.reduce((sum, item) => sum + item.total_interactions, 0) || 0;
  const totalClicks = contentPerformance?.reduce((sum, item) => sum + item.clicks, 0) || 0;
  const avgEngagement = contentPerformance?.reduce((sum, item) => sum + item.engagement_rate, 0) / (contentPerformance?.length || 1) || 0;
  const topPerformer = contentPerformance?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Content & AI Performance</h2>
          <p className="text-muted-foreground">
            Monitor AI-generated content performance, user engagement, and content analytics
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiAnalytics?.totalContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              {aiAnalytics?.aiGeneratedContent || 0} AI-generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              User interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Engagement rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Content Trends</CardTitle>
            <CardDescription>Content creation and view trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aiAnalytics?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="content" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Content Created"
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Total Views"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content by Type</CardTitle>
            <CardDescription>Distribution of content across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aiAnalytics?.contentByType || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(aiAnalytics?.contentByType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Performing Content
          </CardTitle>
          <CardDescription>Highest engagement content items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(aiAnalytics?.topPerformingContent || []).slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Type: {item.type}</span>
                    <span>Views: {item.views.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentPerformanceTab;