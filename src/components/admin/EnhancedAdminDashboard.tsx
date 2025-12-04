
import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import AdminContentStatsGrid from './dashboard/AdminContentStatsGrid';
import AdminRecentActivity from './dashboard/AdminRecentActivity';
import { Loader2 } from 'lucide-react';

const EnhancedAdminDashboard = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Unable to load dashboard stats. Please refresh the page.</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Recent Activity */}
      <div className="animate-fade-in">
        <AdminRecentActivity blogPosts={stats.recentBlogPosts} />
      </div>

      {/* Enhanced Content Stats Grid */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Overview</h2>
          <p className="text-gray-600">Manage all your content and view quick stats at a glance</p>
        </div>
        
        <AdminContentStatsGrid stats={stats} />
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
