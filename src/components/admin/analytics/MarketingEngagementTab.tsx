import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mail, Users, TrendingUp, MousePointer } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useEnhancedNewsletterSubscribers } from '@/hooks/useEnhancedNewsletterSubscribers';
import { Skeleton } from '@/components/ui/skeleton';

const MarketingEngagementTab = () => {
  const { 
    subscribers, 
    loading, 
    refetch, 
    getSubscriberStats 
  } = useEnhancedNewsletterSubscribers();

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      refetch();
    };

    window.addEventListener('resetMarketingEngagement', handleReset);
    return () => window.removeEventListener('resetMarketingEngagement', handleReset);
  }, [refetch]);

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
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

  const stats = getSubscriberStats();
  
  // Prepare chart data
  const contactSourceData = Object.entries(stats.contactSources).map(([source, count]) => ({
    name: source.charAt(0).toUpperCase() + source.slice(1),
    value: count,
    color: source === 'website' ? 'hsl(var(--primary))' : 
           source === 'social' ? 'hsl(var(--secondary))' : 
           source === 'email' ? 'hsl(var(--accent))' : 
           'hsl(var(--muted))'
  }));

  // Weekly engagement trends (simulated data for demo)
  const weeklyTrends = [
    { week: 'Week 1', opens: 245, clicks: 67, conversions: 12 },
    { week: 'Week 2', opens: 289, clicks: 78, conversions: 15 },
    { week: 'Week 3', opens: 312, clicks: 89, conversions: 18 },
    { week: 'Week 4', opens: 298, clicks: 82, conversions: 16 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Marketing & Engagement</h2>
          <p className="text-muted-foreground">
            Track newsletter performance, subscriber engagement, and marketing campaign effectiveness
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
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Email opt-ins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Subscribers</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.smsSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              SMS opt-ins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-Channel</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bothChannels}</div>
            <p className="text-xs text-muted-foreground">
              Both email & SMS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Sources</CardTitle>
            <CardDescription>Where subscribers are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contactSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contactSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Engagement Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Engagement Trends</CardTitle>
            <CardDescription>Email opens, clicks, and conversions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="opens" fill="hsl(var(--primary))" name="Opens" />
                <Bar dataKey="clicks" fill="hsl(var(--secondary))" name="Clicks" />
                <Bar dataKey="conversions" fill="hsl(var(--accent))" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscriber Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriber Breakdown</CardTitle>
          <CardDescription>Detailed view of subscriber preferences and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.emailSubscribers}</div>
              <div className="text-sm text-muted-foreground">Email Only</div>
              <Badge variant="secondary" className="mt-2">
                {((stats.emailSubscribers / stats.totalSubscribers) * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-secondary">{stats.smsSubscribers}</div>
              <div className="text-sm text-muted-foreground">SMS Only</div>
              <Badge variant="secondary" className="mt-2">
                {((stats.smsSubscribers / stats.totalSubscribers) * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-accent">{stats.bothChannels}</div>
              <div className="text-sm text-muted-foreground">Both Channels</div>
              <Badge variant="secondary" className="mt-2">
                {((stats.bothChannels / stats.totalSubscribers) * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {stats.totalSubscribers - stats.emailSubscribers - stats.smsSubscribers + stats.bothChannels}
              </div>
              <div className="text-sm text-muted-foreground">Inactive</div>
              <Badge variant="outline" className="mt-2">
                {(((stats.totalSubscribers - stats.emailSubscribers - stats.smsSubscribers + stats.bothChannels) / stats.totalSubscribers) * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingEngagementTab;