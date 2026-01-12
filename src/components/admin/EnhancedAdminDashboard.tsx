import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSimplifiedAnalytics } from '@/hooks/useSimplifiedAnalytics';
import AdminContentStatsGrid from './dashboard/AdminContentStatsGrid';
import AdminRecentActivity from './dashboard/AdminRecentActivity';
import DashboardSummaryBar from './dashboard/DashboardSummaryBar';
import { Loader2 } from 'lucide-react';

const EnhancedAdminDashboard = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { analytics, loading: analyticsLoading, refresh } = useSimplifiedAnalytics();

  const isLoading = statsLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Unable to load dashboard stats. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats Bar */}
      <DashboardSummaryBar
        checkInsToday={analytics.checkInsToday}
        checkOutsToday={analytics.checkOutsToday}
        openWorkOrders={analytics.openWorkOrders}
        bookingsThisMonth={analytics.bookingsThisMonth}
        revenueThisMonth={analytics.revenueThisMonth}
        averageRating={analytics.averageRating}
        totalReviews={analytics.totalReviews}
        totalSubscribers={analytics.totalSubscribers}
      />

      {/* Content Overview - Compact Grid */}
      {stats && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Content Overview</h2>
          <AdminContentStatsGrid stats={stats} />
        </div>
      )}

      {/* Recent Activity */}
      {stats && (
        <AdminRecentActivity blogPosts={stats.recentBlogPosts} />
      )}
    </div>
  );
};

export default EnhancedAdminDashboard;
