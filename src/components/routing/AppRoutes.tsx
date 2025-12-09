import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';

// Platform pages
import PlatformLayout from '@/components/layouts/PlatformLayout';
import PlatformHome from '@/pages/platform/PlatformHome';
import Features from '@/pages/platform/Features';
import Pricing from '@/pages/platform/Pricing';
import PlatformAbout from '@/pages/platform/PlatformAbout';
import PlatformBlog from '@/pages/platform/PlatformBlog';
import PlatformAuth from '@/pages/platform/PlatformAuth';

// Tenant pages
import PublicLayout from '@/components/layouts/PublicLayout';
import Index from '@/pages/Index';
import Properties from '@/pages/Properties';
import PropertyPage from '@/components/PropertyPage';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Experiences from '@/pages/Experiences';
import Events from '@/pages/Events';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import SearchResults from '@/pages/SearchResults';
import Auth from '@/pages/Auth';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import FAQ from '@/pages/FAQ';
import Listings from '@/pages/Listings';
import DynamicPage from '@/components/DynamicPage';
import BookingPage from '@/pages/BookingPage';
import BookingSuccessPage from '@/pages/BookingSuccessPage';
import BookingCancelledPage from '@/pages/BookingCancelledPage';
import GuestPortalPage from '@/pages/guest/GuestPortalPage';
import CheckinPage from '@/pages/guest/CheckinPage';
import GuidebookPage from '@/pages/guest/GuidebookPage';

// Shared pages
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayoutWrapper from '@/components/layouts/AdminLayoutWrapper';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import BlogManagement from '@/pages/BlogManagement';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminPageManagement from '@/pages/admin/AdminPageManagement';
import AdminSettingsHub from '@/pages/admin/AdminSettingsHub';
import AdminNewsletterManagement from '@/pages/admin/AdminNewsletterManagement';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminPlaces from '@/pages/admin/AdminPlaces';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminWorkOrders from '@/pages/admin/AdminWorkOrders';
import AdminContractors from '@/pages/admin/AdminContractors';
import AdminUnifiedAnalytics from '@/pages/admin/AdminUnifiedAnalytics';
import HostAnalyticsPage from '@/pages/admin/HostAnalyticsPage';
import HostBookingsPage from '@/pages/admin/HostBookingsPage';
import HostCommunicationPage from '@/pages/admin/HostCommunicationPage';
import BookingTimelinePage from '@/pages/admin/BookingTimelinePage';
import AdminProfile from '@/pages/AdminProfile';
import AdminSystemAdministration from '@/pages/admin/AdminSystemAdministration';
import AdminTurnoProblems from '@/pages/admin/AdminTurnoProblems';
import AdminPriceLabs from '@/pages/admin/AdminPriceLabs';
import GuestExperiencePage from '@/pages/admin/GuestExperiencePage';
import AdminChecklists from '@/pages/admin/AdminChecklists';
import SuperAdminPanel from '@/pages/admin/SuperAdminPanel';
import OrganizationSignup from '@/pages/onboarding/OrganizationSignup';
import OnboardingWizard from '@/pages/onboarding/OnboardingWizard';

const AppRoutes: React.FC = () => {
  const { isPlatformSite } = usePlatform();

  if (isPlatformSite) {
    return (
      <Routes>
        {/* Platform Marketing Routes (staymoxie.com) */}
        <Route path="/" element={<PlatformLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="features" element={<Features />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<PlatformAbout />} />
          <Route path="blog" element={<PlatformBlog />} />
          <Route path="auth" element={<PlatformAuth />} />
          <Route path="login" element={<PlatformAuth />} />
        </Route>

        {/* Shared Onboarding Routes */}
        <Route path="/signup" element={<ProtectedRoute><OrganizationSignup /></ProtectedRoute>} />
        <Route path="/admin/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />

        {/* Shared Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="blog" element={<BlogManagement />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="pages" element={<AdminPageManagement />} />
          <Route path="settings" element={<AdminSettingsHub />} />
          {/* Redirects for old routes */}
          <Route path="user-access-management" element={<Navigate to="/admin/settings" replace />} />
          <Route path="organization" element={<Navigate to="/admin/settings" replace />} />
          <Route path="newsletter" element={<AdminNewsletterManagement />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="places" element={<AdminPlaces />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="work-orders" element={<AdminWorkOrders />} />
          <Route path="contractors" element={<AdminContractors />} />
          <Route path="turno-problems" element={<AdminTurnoProblems />} />
          <Route path="checklists" element={<AdminChecklists />} />
          <Route path="pricelabs" element={<AdminPriceLabs />} />
          <Route path="analytics" element={<AdminUnifiedAnalytics />} />
          <Route path="system-administration" element={<AdminSystemAdministration />} />
          <Route path="host/analytics" element={<HostAnalyticsPage />} />
          <Route path="host/bookings" element={<HostBookingsPage />} />
          <Route path="calendar" element={<BookingTimelinePage />} />
          <Route path="host/communication" element={<HostCommunicationPage />} />
          <Route path="guest-experience" element={<GuestExperiencePage />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="platform" element={<SuperAdminPanel />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Tenant Routes (tenant.lovable.app or custom domains)
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Index />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:addressSlug" element={<PropertyPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/events" element={<Events />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/booking/:propertyId" element={<BookingPage />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
        <Route path="/booking-cancelled" element={<BookingCancelledPage />} />
        <Route path="/guest/portal" element={<GuestPortalPage />} />
        <Route path="/guest/checkin/:reservationId" element={<CheckinPage />} />
        <Route path="/guest/guidebook/:propertyId" element={<GuidebookPage />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Route>

      {/* Onboarding Routes */}
      <Route path="/signup" element={<ProtectedRoute><OrganizationSignup /></ProtectedRoute>} />
      <Route path="/admin/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="blog" element={<BlogManagement />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="pages" element={<AdminPageManagement />} />
        <Route path="settings" element={<AdminSettingsHub />} />
        {/* Redirects for old routes */}
        <Route path="user-access-management" element={<Navigate to="/admin/settings" replace />} />
        <Route path="organization" element={<Navigate to="/admin/settings" replace />} />
        <Route path="newsletter" element={<AdminNewsletterManagement />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="places" element={<AdminPlaces />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="work-orders" element={<AdminWorkOrders />} />
        <Route path="contractors" element={<AdminContractors />} />
        <Route path="turno-problems" element={<AdminTurnoProblems />} />
        <Route path="checklists" element={<AdminChecklists />} />
        <Route path="pricelabs" element={<AdminPriceLabs />} />
        <Route path="analytics" element={<AdminUnifiedAnalytics />} />
        <Route path="system-administration" element={<AdminSystemAdministration />} />
        <Route path="host/analytics" element={<HostAnalyticsPage />} />
        <Route path="host/bookings" element={<HostBookingsPage />} />
        <Route path="calendar" element={<BookingTimelinePage />} />
        <Route path="host/communication" element={<HostCommunicationPage />} />
        <Route path="guest-experience" element={<GuestExperiencePage />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="platform" element={<SuperAdminPanel />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
