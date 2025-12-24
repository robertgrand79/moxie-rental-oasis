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
import ResetPassword from '@/pages/ResetPassword';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import FAQ from '@/pages/FAQ';
import DataPrivacy from '@/pages/legal/DataPrivacy';
import Accessibility from '@/pages/legal/Accessibility';
import Listings from '@/pages/Listings';
import DynamicPage from '@/components/DynamicPage';
import BookingPage from '@/pages/BookingPage';
import BookingSuccessPage from '@/pages/BookingSuccessPage';
import BookingCancelledPage from '@/pages/BookingCancelledPage';
import GuestPortalPage from '@/pages/guest/GuestPortalPage';
import CheckinPage from '@/pages/guest/CheckinPage';
import GuidebookPage from '@/pages/guest/GuidebookPage';
import AcknowledgePage from '@/pages/AcknowledgePage';
import ContractorPortal from '@/pages/ContractorPortal';
import AcceptInvitation from '@/pages/AcceptInvitation';

// Shared pages
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayoutWrapper from '@/components/layouts/AdminLayoutWrapper';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import BlogManagement from '@/pages/BlogManagement';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminPageManagement from '@/pages/admin/AdminPageManagement';

import AdminNewsletterManagement from '@/pages/admin/AdminNewsletterManagement';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminPlaces from '@/pages/admin/AdminPlaces';
import AdminReviews from '@/pages/admin/AdminReviews';
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
import AdminAIAssistant from '@/pages/admin/AdminAIAssistant';
import GuidebookEditorPage from '@/pages/admin/GuidebookEditorPage';
import InboxPage from '@/pages/admin/InboxPage';
import ConversationDetailPage from '@/pages/admin/ConversationDetailPage';
import NotificationsPage from '@/pages/admin/NotificationsPage';
import OrganizationSignup from '@/pages/onboarding/OrganizationSignup';
import OnboardingWizard from '@/pages/onboarding/OnboardingWizard';

// Settings pages - Flattened sidebar navigation
import GeneralSettingsPage from '@/pages/admin/settings/GeneralSettingsPage';
import DomainSettingsPage from '@/pages/admin/settings/DomainSettingsPage';
import BillingSettingsPage from '@/pages/admin/settings/BillingSettingsPage';
import SiteInfoSettingsPage from '@/pages/admin/settings/SiteInfoSettingsPage';
import HeroSettingsPage from '@/pages/admin/settings/HeroSettingsPage';
import AboutSettingsPage from '@/pages/admin/settings/AboutSettingsPage';
import ContactSettingsPage from '@/pages/admin/settings/ContactSettingsPage';
import SEOSettingsPage from '@/pages/admin/settings/SEOSettingsPage';
import AnalyticsSettingsPage from '@/pages/admin/settings/AnalyticsSettingsPage';
import ColorsSettingsPage from '@/pages/admin/settings/ColorsSettingsPage';
import FontsSettingsPage from '@/pages/admin/settings/FontsSettingsPage';
import BrandingSettingsPage from '@/pages/admin/settings/BrandingSettingsPage';
import UsersSettingsPage from '@/pages/admin/settings/UsersSettingsPage';
import RolesSettingsPage from '@/pages/admin/settings/RolesSettingsPage';
import NotificationsSettingsPage from '@/pages/admin/settings/NotificationsSettingsPage';
import AIAssistantSettingsPage from '@/pages/admin/settings/AIAssistantSettingsPage';
import CommunicationsSettingsPage from '@/pages/admin/settings/CommunicationsSettingsPage';
import SmartHomeSettingsPage from '@/pages/admin/settings/SmartHomeSettingsPage';
import ServicesSettingsPage from '@/pages/admin/settings/ServicesSettingsPage';
import StripeSettingsPage from '@/pages/admin/settings/StripeSettingsPage';
import PriceLabsSettingsPage from '@/pages/admin/settings/PriceLabsSettingsPage';
import SetupWizardPage from '@/pages/admin/settings/SetupWizardPage';

const AppRoutes: React.FC = () => {
  const { isPlatformSite } = usePlatform();

  if (isPlatformSite) {
    return (
      <Routes>
        {/* Platform Marketing Routes (staymoxie.com) */}
        <Route path="/" element={<PlatformLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="features" element={<Features />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<PlatformAbout />} />
          <Route path="blog" element={<PlatformBlog />} />
          <Route path="auth" element={<PlatformAuth />} />
          <Route path="login" element={<PlatformAuth />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Public standalone routes */}
        <Route path="/acknowledge" element={<AcknowledgePage />} />
        <Route path="/contractor/:token" element={<ContractorPortal />} />
        <Route path="/accept-invite" element={<AcceptInvitation />} />

        {/* Shared Onboarding Routes */}
        <Route path="/signup" element={<ProtectedRoute><OrganizationSignup /></ProtectedRoute>} />
        <Route path="/admin/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />

        {/* Shared Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="blog" element={<BlogManagement />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="properties/:propertyId" element={<AdminProperties />} />
        <Route path="pages" element={<AdminPageManagement />} />
          <Route path="settings" element={<Navigate to="/admin/settings/general" replace />} />
          {/* Flattened settings routes */}
          <Route path="settings/setup" element={<SetupWizardPage />} />
          <Route path="settings/general" element={<GeneralSettingsPage />} />
          <Route path="settings/domain" element={<DomainSettingsPage />} />
          <Route path="settings/billing" element={<BillingSettingsPage />} />
          <Route path="settings/site-info" element={<SiteInfoSettingsPage />} />
          <Route path="settings/hero" element={<HeroSettingsPage />} />
          <Route path="settings/about" element={<AboutSettingsPage />} />
          <Route path="settings/contact" element={<ContactSettingsPage />} />
          <Route path="settings/seo" element={<SEOSettingsPage />} />
          <Route path="settings/analytics" element={<AnalyticsSettingsPage />} />
          <Route path="settings/colors" element={<ColorsSettingsPage />} />
          <Route path="settings/fonts" element={<FontsSettingsPage />} />
          <Route path="settings/branding" element={<BrandingSettingsPage />} />
          <Route path="settings/users" element={<UsersSettingsPage />} />
          <Route path="settings/roles" element={<RolesSettingsPage />} />
          <Route path="settings/notifications-settings" element={<NotificationsSettingsPage />} />
          <Route path="settings/ai-assistant" element={<AIAssistantSettingsPage />} />
          <Route path="settings/communications" element={<CommunicationsSettingsPage />} />
          <Route path="settings/smart-home" element={<SmartHomeSettingsPage />} />
          <Route path="settings/services" element={<ServicesSettingsPage />} />
          <Route path="settings/stripe" element={<StripeSettingsPage />} />
          <Route path="settings/pricelabs" element={<PriceLabsSettingsPage />} />
          {/* Redirects for old settings routes */}
          <Route path="settings/organization" element={<Navigate to="/admin/settings/general" replace />} />
          <Route path="settings/site-content" element={<Navigate to="/admin/settings/site-info" replace />} />
          <Route path="settings/appearance" element={<Navigate to="/admin/settings/colors" replace />} />
          <Route path="settings/team" element={<Navigate to="/admin/settings/users" replace />} />
          <Route path="settings/integrations" element={<Navigate to="/admin/settings/ai-assistant" replace />} />
          <Route path="settings/payments" element={<Navigate to="/admin/settings/stripe" replace />} />
          {/* Redirects for old routes */}
          <Route path="user-access-management" element={<Navigate to="/admin/settings/users" replace />} />
          <Route path="organization" element={<Navigate to="/admin/settings/general" replace />} />
          <Route path="newsletter" element={<AdminNewsletterManagement />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="places" element={<AdminPlaces />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="testimonials" element={<Navigate to="/admin/reviews" replace />} />
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
        <Route path="host/inbox" element={<InboxPage />} />
          <Route path="host/inbox/:threadId" element={<ConversationDetailPage />} />
          <Route path="guest-experience" element={<GuestExperiencePage />} />
          <Route path="guidebooks/:propertyId/edit" element={<GuidebookEditorPage />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="platform" element={<SuperAdminPanel />} />
          <Route path="ai-assistant" element={<AdminAIAssistant />} />
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
        <Route path="home" element={<Navigate to="/" replace />} />
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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/data-privacy" element={<DataPrivacy />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/booking/:propertyId" element={<BookingPage />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
        <Route path="/booking-cancelled" element={<BookingCancelledPage />} />
        <Route path="/guest/portal" element={<GuestPortalPage />} />
        <Route path="/guest/checkin/:reservationId" element={<CheckinPage />} />
        <Route path="/guest/guidebook/:propertyId" element={<GuidebookPage />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Route>

      {/* Public standalone routes */}
      <Route path="/acknowledge" element={<AcknowledgePage />} />
      <Route path="/contractor/:token" element={<ContractorPortal />} />

      {/* Onboarding Routes */}
      <Route path="/signup" element={<ProtectedRoute><OrganizationSignup /></ProtectedRoute>} />
      <Route path="/admin/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="blog" element={<BlogManagement />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="properties/:propertyId" element={<AdminProperties />} />
        <Route path="pages" element={<AdminPageManagement />} />
        <Route path="settings" element={<Navigate to="/admin/settings/general" replace />} />
        {/* Flattened settings routes */}
        <Route path="settings/setup" element={<SetupWizardPage />} />
        <Route path="settings/general" element={<GeneralSettingsPage />} />
        <Route path="settings/domain" element={<DomainSettingsPage />} />
        <Route path="settings/billing" element={<BillingSettingsPage />} />
        <Route path="settings/site-info" element={<SiteInfoSettingsPage />} />
        <Route path="settings/hero" element={<HeroSettingsPage />} />
        <Route path="settings/about" element={<AboutSettingsPage />} />
        <Route path="settings/contact" element={<ContactSettingsPage />} />
        <Route path="settings/seo" element={<SEOSettingsPage />} />
        <Route path="settings/analytics" element={<AnalyticsSettingsPage />} />
        <Route path="settings/colors" element={<ColorsSettingsPage />} />
        <Route path="settings/fonts" element={<FontsSettingsPage />} />
        <Route path="settings/branding" element={<BrandingSettingsPage />} />
        <Route path="settings/users" element={<UsersSettingsPage />} />
        <Route path="settings/roles" element={<RolesSettingsPage />} />
        <Route path="settings/notifications-settings" element={<NotificationsSettingsPage />} />
        <Route path="settings/ai-assistant" element={<AIAssistantSettingsPage />} />
        <Route path="settings/communications" element={<CommunicationsSettingsPage />} />
        <Route path="settings/smart-home" element={<SmartHomeSettingsPage />} />
        <Route path="settings/services" element={<ServicesSettingsPage />} />
        <Route path="settings/stripe" element={<StripeSettingsPage />} />
        <Route path="settings/pricelabs" element={<PriceLabsSettingsPage />} />
        {/* Redirects for old settings routes */}
        <Route path="settings/organization" element={<Navigate to="/admin/settings/general" replace />} />
        <Route path="settings/site-content" element={<Navigate to="/admin/settings/site-info" replace />} />
        <Route path="settings/appearance" element={<Navigate to="/admin/settings/colors" replace />} />
        <Route path="settings/team" element={<Navigate to="/admin/settings/users" replace />} />
        <Route path="settings/integrations" element={<Navigate to="/admin/settings/ai-assistant" replace />} />
        <Route path="settings/payments" element={<Navigate to="/admin/settings/stripe" replace />} />
        <Route path="settings/local-content" element={<Navigate to="/admin/settings/site-info" replace />} />
        {/* Redirects for old routes */}
        <Route path="user-access-management" element={<Navigate to="/admin/settings/users" replace />} />
        <Route path="organization" element={<Navigate to="/admin/settings/general" replace />} />
        <Route path="newsletter" element={<AdminNewsletterManagement />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="places" element={<AdminPlaces />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="testimonials" element={<Navigate to="/admin/reviews" replace />} />
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
        <Route path="host/inbox" element={<InboxPage />} />
        <Route path="host/inbox/:threadId" element={<ConversationDetailPage />} />
        <Route path="guest-experience" element={<GuestExperiencePage />} />
        <Route path="guidebooks/:propertyId/edit" element={<GuidebookEditorPage />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="platform" element={<SuperAdminPanel />} />
        <Route path="ai-assistant" element={<AdminAIAssistant />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
