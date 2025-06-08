
import React from 'react';
import { useProperties } from '@/hooks/useProperties';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest';
import { useLifestyleGallery } from '@/hooks/useLifestyleGallery';
import { useTestimonials } from '@/hooks/useTestimonials';
import { usePages } from '@/hooks/usePages';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';
import AdminWelcomeSection from './dashboard/AdminWelcomeSection';
import AdminContentStatsGrid from './dashboard/AdminContentStatsGrid';
import AdminRecentActivity from './dashboard/AdminRecentActivity';

const EnhancedAdminDashboard = () => {
  const { properties } = useProperties();
  const { blogPosts } = useBlogPosts();
  const { events } = useEugeneEvents();
  const { pointsOfInterest } = usePointsOfInterest();
  const { galleryItems } = useLifestyleGallery();
  const { testimonials } = useTestimonials();
  const { pages } = usePages();
  const { subscriberCount } = useNewsletterStats();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <AdminWelcomeSection />

      {/* Enhanced Content Stats Grid */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Overview</h2>
          <p className="text-gray-600">Manage all your content and view quick stats at a glance</p>
        </div>
        
        <AdminContentStatsGrid 
          properties={properties}
          blogPosts={blogPosts}
          pointsOfInterest={pointsOfInterest}
          galleryItems={galleryItems}
          testimonials={testimonials}
          subscriberCount={subscriberCount}
        />
      </div>

      {/* Recent Activity */}
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <AdminRecentActivity blogPosts={blogPosts} />
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
