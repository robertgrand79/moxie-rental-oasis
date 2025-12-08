import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Mail, Calendar, Activity, Clock } from 'lucide-react';
import { useSimplifiedAnalytics } from '@/hooks/useSimplifiedAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const SimplifiedAnalyticsDashboard = () => {
  const { analytics, loading, refresh } = useSimplifiedAnalytics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10';
      case 'warning': return 'bg-yellow-500/10';
      case 'error': return 'bg-red-500/10';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Slow';
      case 'error': return 'Issues';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Last updated: {format(analytics.lastUpdated, 'h:mm:ss a')}
        </p>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Real-time Visitors */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics.realTimeVisitors}</p>
                <p className="text-sm text-muted-foreground">Live visitors now</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-muted-foreground">Currently browsing</span>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Subscribers */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics.totalSubscribers}</p>
                <p className="text-sm text-muted-foreground">Newsletter subscribers</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              +{analytics.subscribersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        {/* Bookings This Month */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics.bookingsThisMonth}</p>
                <p className="text-sm text-muted-foreground">Bookings this month</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Direct reservations
            </p>
          </CardContent>
        </Card>

        {/* Site Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full ${getStatusBg(analytics.siteStatus)} flex items-center justify-center`}>
                <Activity className={`h-6 w-6 ${getStatusColor(analytics.siteStatus)}`} />
              </div>
              <div>
                <p className={`text-3xl font-bold ${getStatusColor(analytics.siteStatus)}`}>
                  {getStatusLabel(analytics.siteStatus)}
                </p>
                <p className="text-sm text-muted-foreground">Site status</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        {/* Load Time */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {analytics.loadTime ? `${(analytics.loadTime / 1000).toFixed(1)}s` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">API response</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Database query time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/reservations">View Bookings</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/newsletter">Newsletters</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/settings">Settings</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/properties">Properties</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedAnalyticsDashboard;
