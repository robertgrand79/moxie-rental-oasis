import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, Users, Mail, Calendar, Activity, Clock, 
  LogIn, LogOut, Wrench, DollarSign, Star 
} from 'lucide-react';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(8)].map((_, i) => (
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

      {/* Today's Activity */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Today's Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Check-ins Today */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{analytics.checkInsToday}</p>
                  <p className="text-sm text-muted-foreground">Check-ins today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check-outs Today */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <LogOut className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{analytics.checkOutsToday}</p>
                  <p className="text-sm text-muted-foreground">Check-outs today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Work Orders */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  analytics.openWorkOrders > 0 ? 'bg-red-500/10' : 'bg-muted'
                }`}>
                  <Wrench className={`h-6 w-6 ${
                    analytics.openWorkOrders > 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${
                    analytics.openWorkOrders > 0 ? 'text-red-500' : ''
                  }`}>{analytics.openWorkOrders}</p>
                  <p className="text-sm text-muted-foreground">Open work orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* This Month */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">This Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bookings This Month */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{analytics.bookingsThisMonth}</p>
                  <p className="text-sm text-muted-foreground">New bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue This Month */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.revenueThisMonth)}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
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
                  <p className="text-sm text-muted-foreground">Subscribers</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                +{analytics.subscribersThisMonth} this month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reputation & Site Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reputation */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Reputation</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Average Rating */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">
                      {analytics.averageRating !== null 
                        ? analytics.averageRating.toFixed(1) 
                        : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Reviews */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{analytics.totalReviews}</p>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Site Health */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Site Health</h3>
          <div className="grid grid-cols-2 gap-4">
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
                    <p className="text-sm text-muted-foreground">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Load Time */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">
                      {analytics.loadTime ? `${(analytics.loadTime / 1000).toFixed(1)}s` : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">API response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/host/bookings">View Bookings</Link>
            </Button>
            {analytics.openWorkOrders > 0 && (
              <Button variant="outline" size="sm" asChild className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                <Link to="/admin/work-orders">Work Orders ({analytics.openWorkOrders})</Link>
              </Button>
            )}
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
