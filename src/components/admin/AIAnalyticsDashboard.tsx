
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MessageSquare, Users, FileText, Eye, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AIAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
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
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - in real implementation, these would be actual queries
      const mockAnalytics = {
        totalContent: 42,
        aiGeneratedContent: 28,
        chatInteractions: 156,
        contentViews: 2834,
        averageResponseTime: 1.2,
        topPerformingContent: [
          { name: 'Eugene Travel Guide', views: 324, type: 'Blog Post' },
          { name: 'Luxury Downtown Loft', views: 289, type: 'Property' },
          { name: 'Local Attractions', views: 267, type: 'Page' },
          { name: 'Weekend Getaway Tips', views: 234, type: 'Blog Post' }
        ],
        contentByType: [
          { name: 'Properties', value: 12, color: '#3b82f6' },
          { name: 'Blog Posts', value: 18, color: '#10b981' },
          { name: 'Pages', value: 8, color: '#f59e0b' },
          { name: 'AI Chat Responses', value: 156, color: '#8b5cf6' }
        ],
        monthlyTrends: [
          { month: 'Jan', content: 8, views: 420 },
          { month: 'Feb', content: 12, views: 680 },
          { month: 'Mar', content: 15, views: 890 },
          { month: 'Apr', content: 18, views: 1200 },
          { month: 'May', content: 22, views: 1450 },
          { month: 'Jun', content: 28, views: 1800 }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor AI performance and content insights</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-3xl font-bold">{analytics.totalContent}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Generated</p>
                <p className="text-3xl font-bold">{analytics.aiGeneratedContent}</p>
                <p className="text-xs text-green-600">
                  {Math.round((analytics.aiGeneratedContent / analytics.totalContent) * 100)}% of total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chat Interactions</p>
                <p className="text-3xl font-bold">{analytics.chatInteractions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-3xl font-bold">{analytics.averageResponseTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Content & Views Trends</CardTitle>
            <CardDescription>Monthly content creation and view statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="content" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Breakdown of content types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.contentByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.contentByType.map((entry, index) => (
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
          <CardTitle>Top Performing Content</CardTitle>
          <CardDescription>Most viewed content across your site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPerformingContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{content.name}</p>
                    <Badge variant="secondary">{content.type}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold">{content.views}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalyticsDashboard;
