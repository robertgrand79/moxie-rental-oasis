
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, MousePointer, Clock, Award, RefreshCw, Calendar, Target } from 'lucide-react';
import { useContentAnalytics } from '@/hooks/useContentAnalytics';

const ContentPerformanceDashboard = () => {
  const { getContentPerformance, getTimeBasedAnalytics, getPopularContent } = useContentAnalytics();
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const { data: contentPerformance, isLoading: performanceLoading, refetch: refetchPerformance } = getContentPerformance;
  const { data: timeAnalytics, isLoading: timeLoading } = getTimeBasedAnalytics;
  const { data: popularContent, isLoading: popularLoading } = getPopularContent;

  const categoryColors = {
    lifestyle: '#3b82f6',
    event: '#10b981',
    poi: '#f59e0b'
  };

  if (performanceLoading || timeLoading || popularLoading) {
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

  const totalViews = contentPerformance?.reduce((sum, item) => sum + item.views, 0) || 0;
  const totalClicks = contentPerformance?.reduce((sum, item) => sum + item.clicks, 0) || 0;
  const averageEngagement = contentPerformance?.length > 0 
    ? contentPerformance.reduce((sum, item) => sum + item.engagement_rate, 0) / contentPerformance.length 
    : 0;
  const topPerformer = contentPerformance?.[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Content Performance Analytics</h2>
          <p className="text-gray-600 mt-1">Track engagement and optimize your content strategy</p>
        </div>
        <Button onClick={() => refetchPerformance()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-green-600">Last 30 days</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-green-600">All interactions</p>
              </div>
              <MousePointer className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
                <p className="text-3xl font-bold">{averageEngagement.toFixed(1)}%</p>
                <p className="text-xs text-blue-600">Click-through rate</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                <p className="text-lg font-bold">{topPerformer?.content_type || 'N/A'}</p>
                <p className="text-xs text-orange-600">
                  Score: {topPerformer?.performance_score || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Content Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Analysis</TabsTrigger>
          <TabsTrigger value="trends">Time Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Content Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Content Performance Ranking</CardTitle>
              <CardDescription>Performance scores based on views, engagement, and recency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPerformance?.slice(0, 10).map((content, index) => (
                  <div key={`${content.content_type}-${content.content_id}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{content.title}</p>
                          <Badge 
                            variant="secondary" 
                            style={{ backgroundColor: categoryColors[content.content_type as keyof typeof categoryColors] + '20', color: categoryColors[content.content_type as keyof typeof categoryColors] }}
                          >
                            {content.content_type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>Views: {content.views}</span>
                          <span>Clicks: {content.clicks}</span>
                          <span>Engagement: {content.engagement_rate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{content.performance_score}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Content Type Engagement</CardTitle>
                <CardDescription>Engagement rates by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={timeAnalytics?.last7Days.byType ? Object.entries(timeAnalytics.last7Days.byType).map(([type, count]) => ({
                        name: type,
                        value: count,
                        color: categoryColors[type as keyof typeof categoryColors]
                      })) : []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {timeAnalytics?.last7Days.byType && Object.entries(timeAnalytics.last7Days.byType).map(([type], index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[type as keyof typeof categoryColors]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity (24h)</CardTitle>
                <CardDescription>Content interactions by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeAnalytics?.last24Hours.hourly || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="interactions" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
              <CardDescription>Content interaction trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{timeAnalytics?.last24Hours.total || 0}</div>
                  <div className="text-sm text-gray-600">Last 24 Hours</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{timeAnalytics?.last7Days.total || 0}</div>
                  <div className="text-sm text-gray-600">Last 7 Days</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{timeAnalytics?.last30Days.total || 0}</div>
                  <div className="text-sm text-gray-600">Last 30 Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Optimization Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve content performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPerformance?.slice(-5).map((content, index) => (
                  <div key={`rec-${content.content_id}`} className="p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{content.content_type} Content</h4>
                      <Badge variant="outline">Low Performance</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      This content has a performance score of {content.performance_score}. Consider:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Update the description to be more engaging</li>
                      <li>• Add high-quality images if missing</li>
                      <li>• Review and optimize the title</li>
                      {content.engagement_rate < 5 && <li>• Consider featuring this content temporarily</li>}
                    </ul>
                  </div>
                ))}
                
                {(!contentPerformance || contentPerformance.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No performance data available yet. Start tracking content interactions to see recommendations.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentPerformanceDashboard;
