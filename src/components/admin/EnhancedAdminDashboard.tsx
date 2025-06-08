
import React from 'react';
import { useProperties } from '@/hooks/useProperties';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest';
import { useLifestyleGallery } from '@/hooks/useLifestyleGallery';
import { useTestimonials } from '@/hooks/useTestimonials';
import { usePages } from '@/hooks/usePages';
import AdminWelcomeSection from './dashboard/AdminWelcomeSection';
import AdminQuickStats from './dashboard/AdminQuickStats';
import AdminFeatureStats from './dashboard/AdminFeatureStats';
import AdminRecentActivity from './dashboard/AdminRecentActivity';
import AdminQuickActionsEnhanced from './dashboard/AdminQuickActionsEnhanced';

const EnhancedAdminDashboard = () => {
  const { properties } = useProperties();
  const { blogPosts } = useBlogPosts();
  const { events } = useEugeneEvents();
  const { pointsOfInterest } = usePointsOfInterest();
  const { galleryItems } = useLifestyleGallery();
  const { testimonials } = useTestimonials();
  const { pages } = usePages();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <AdminWelcomeSection />

      {/* Main Content */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Quick Stats Grid */}
        <div className="mb-8">
          <AdminQuickStats 
            properties={properties}
            blogPosts={blogPosts}
            pages={pages}
            events={events}
          />
        </div>

        {/* Feature Stats */}
        <AdminFeatureStats 
          pointsOfInterest={pointsOfInterest}
          galleryItems={galleryItems}
          testimonials={testimonials}
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminRecentActivity blogPosts={blogPosts} />
        <AdminQuickActionsEnhanced />
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
