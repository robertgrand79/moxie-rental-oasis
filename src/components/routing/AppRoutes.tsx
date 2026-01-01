import React, { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';

// Platform pages (loaded eagerly - smaller)
import PlatformLayout from '@/components/layouts/PlatformLayout';
import PlatformHome from '@/pages/platform/PlatformHome';
import Features from '@/pages/platform/Features';
import Pricing from '@/pages/platform/Pricing';
import PlatformAbout from '@/pages/platform/PlatformAbout';
import PlatformBlog from '@/pages/platform/PlatformBlog';
import PlatformAuth from '@/pages/platform/PlatformAuth';

// Core public pages (loaded eagerly - critical path)
import PublicLayout from '@/components/layouts/PublicLayout';
import Index from '@/pages/Index';
import Properties from '@/pages/Properties';
import PropertyPage from '@/components/PropertyPage';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';

// Lazy-loaded public pages
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Experiences = lazy(() => import('@/pages/Experiences'));
const Events = lazy(() => import('@/pages/Events'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const SearchResults = lazy(() => import('@/pages/SearchResults'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const DataPrivacy = lazy(() => import('@/pages/legal/DataPrivacy'));
const Accessibility = lazy(() => import('@/pages/legal/Accessibility'));
const Listings = lazy(() => import('@/pages/Listings'));
const DynamicPage = lazy(() => import('@/components/DynamicPage'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const BookingSuccessPage = lazy(() => import('@/pages/BookingSuccessPage'));
const BookingCancelledPage = lazy(() => import('@/pages/BookingCancelledPage'));
const GuestPortalPage = lazy(() => import('@/pages/guest/GuestPortalPage'));
const CheckinPage = lazy(() => import('@/pages/guest/CheckinPage'));
const GuidebookPage = lazy(() => import('@/pages/guest/GuidebookPage'));
const AcknowledgePage = lazy(() => import('@/pages/AcknowledgePage'));
const ContractorPortal = lazy(() => import('@/pages/ContractorPortal'));
const AcceptInvitation = lazy(() => import('@/pages/AcceptInvitation'));
const StatusPage = lazy(() => import('@/pages/StatusPage'));

// Core admin (loaded eagerly)
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayoutWrapper from '@/components/layouts/AdminLayoutWrapper';
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Lazy-loaded admin pages (heavy pages)
const BlogManagement = lazy(() => import('@/pages/BlogManagement'));
const AdminProperties = lazy(() => import('@/pages/admin/AdminProperties'));
const AdminPageManagement = lazy(() => import('@/pages/admin/AdminPageManagement'));
const AdminNewsletterManagement = lazy(() => import('@/pages/admin/AdminNewsletterManagement'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminPlaces = lazy(() => import('@/pages/admin/AdminPlaces'));
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews'));
const AdminWorkOrders = lazy(() => import('@/pages/admin/AdminWorkOrders'));
const AdminContractors = lazy(() => import('@/pages/admin/AdminContractors'));
const AdminUnifiedAnalytics = lazy(() => import('@/pages/admin/AdminUnifiedAnalytics'));
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'));
const HostAnalyticsPage = lazy(() => import('@/pages/admin/HostAnalyticsPage'));
const HostBookingsPage = lazy(() => import('@/pages/admin/HostBookingsPage'));
const HostCommunicationPage = lazy(() => import('@/pages/admin/HostCommunicationPage'));
const BookingTimelinePage = lazy(() => import('@/pages/admin/BookingTimelinePage'));
const AdminProfile = lazy(() => import('@/pages/AdminProfile'));
const AdminSystemAdministration = lazy(() => import('@/pages/admin/AdminSystemAdministration'));
const AdminTurnoProblems = lazy(() => import('@/pages/admin/AdminTurnoProblems'));
const AdminPriceLabs = lazy(() => import('@/pages/admin/AdminPriceLabs'));
const GuestExperiencePage = lazy(() => import('@/pages/admin/GuestExperiencePage'));
const AdminChecklists = lazy(() => import('@/pages/admin/AdminChecklists'));
const SuperAdminPanel = lazy(() => import('@/pages/admin/SuperAdminPanel'));
const AdminAIAssistant = lazy(() => import('@/pages/admin/AdminAIAssistant'));
const GuidebookEditorPage = lazy(() => import('@/pages/admin/GuidebookEditorPage'));
const InboxPage = lazy(() => import('@/pages/admin/InboxPage'));
const ConversationDetailPage = lazy(() => import('@/pages/admin/ConversationDetailPage'));
const HelpCenterPage = lazy(() => import('@/pages/admin/HelpCenterPage'));
const SupportTicketsPage = lazy(() => import('@/pages/admin/SupportTicketsPage'));
const NotificationsPage = lazy(() => import('@/pages/admin/NotificationsPage'));
const OrganizationSignup = lazy(() => import('@/pages/onboarding/OrganizationSignup'));
const OnboardingWizard = lazy(() => import('@/pages/onboarding/OnboardingWizard'));

// Lazy-loaded settings pages
const GeneralSettingsPage = lazy(() => import('@/pages/admin/settings/GeneralSettingsPage'));
const DomainSettingsPage = lazy(() => import('@/pages/admin/settings/DomainSettingsPage'));
const BillingSettingsPage = lazy(() => import('@/pages/admin/settings/BillingSettingsPage'));
const SiteInfoSettingsPage = lazy(() => import('@/pages/admin/settings/SiteInfoSettingsPage'));
const HeroSettingsPage = lazy(() => import('@/pages/admin/settings/HeroSettingsPage'));
const AboutSettingsPage = lazy(() => import('@/pages/admin/settings/AboutSettingsPage'));
const ContactSettingsPage = lazy(() => import('@/pages/admin/settings/ContactSettingsPage'));
const SEOSettingsPage = lazy(() => import('@/pages/admin/settings/SEOSettingsPage'));
const AnalyticsSettingsPage = lazy(() => import('@/pages/admin/settings/AnalyticsSettingsPage'));
const ColorsSettingsPage = lazy(() => import('@/pages/admin/settings/ColorsSettingsPage'));
const FontsSettingsPage = lazy(() => import('@/pages/admin/settings/FontsSettingsPage'));
const BrandingSettingsPage = lazy(() => import('@/pages/admin/settings/BrandingSettingsPage'));
const UsersSettingsPage = lazy(() => import('@/pages/admin/settings/UsersSettingsPage'));
const RolesSettingsPage = lazy(() => import('@/pages/admin/settings/RolesSettingsPage'));
const NotificationsSettingsPage = lazy(() => import('@/pages/admin/settings/NotificationsSettingsPage'));
const AIAssistantSettingsPage = lazy(() => import('@/pages/admin/settings/AIAssistantSettingsPage'));
const CommunicationsSettingsPage = lazy(() => import('@/pages/admin/settings/CommunicationsSettingsPage'));
const SmartHomeSettingsPage = lazy(() => import('@/pages/admin/settings/SmartHomeSettingsPage'));
const ServicesSettingsPage = lazy(() => import('@/pages/admin/settings/ServicesSettingsPage'));
const StripeSettingsPage = lazy(() => import('@/pages/admin/settings/StripeSettingsPage'));
const PriceLabsSettingsPage = lazy(() => import('@/pages/admin/settings/PriceLabsSettingsPage'));
const SetupWizardPage = lazy(() => import('@/pages/admin/settings/SetupWizardPage'));
const TVDevicesSettingsPage = lazy(() => import('@/pages/admin/settings/TVDevicesSettingsPage'));
const NavigationSettingsPage = lazy(() => import('@/pages/admin/settings/NavigationSettingsPage'));

// TV Pages
const TVWelcome = lazy(() => import('@/pages/tv/TVWelcome'));
const TVGuestPortal = lazy(() => import('@/pages/tv/TVGuestPortal'));
const TVSignage = lazy(() => import('@/pages/tv/TVSignage'));
const PairTV = lazy(() => import('@/pages/tv/PairTV'));

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
          <Route path="/status" element={<Navigate to="/admin/status" replace />} />

          {/* TV Routes */}
          <Route path="/tv/:propertyId" element={<TVWelcome />} />
          <Route path="/tv/:propertyId/portal" element={<TVGuestPortal />} />
          <Route path="/tv/:propertyId/signage" element={<TVSignage />} />
          <Route path="/pair-tv" element={<PairTV />} />

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
            <Route path="settings/navigation" element={<NavigationSettingsPage />} />
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
            <Route path="settings/tv-devices" element={<TVDevicesSettingsPage />} />
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
            <Route path="reports" element={<AdminReportsPage />} />
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
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="support-tickets" element={<SupportTicketsPage />} />
            <Route path="status" element={<StatusPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
    );
  }

  // Tenant Routes (tenant.lovable.app or custom domains)
  return (
      <Routes>
        {/* Platform Marketing Routes (accessible via /platform on any domain) */}
        <Route path="/platform" element={<PlatformLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="features" element={<Features />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<PlatformAbout />} />
          <Route path="blog" element={<PlatformBlog />} />
        </Route>

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
          <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
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
        <Route path="/status" element={<Navigate to="/admin/status" replace />} />

        {/* TV Routes */}
        <Route path="/tv/:propertyId" element={<TVWelcome />} />
        <Route path="/tv/:propertyId/portal" element={<TVGuestPortal />} />
        <Route path="/tv/:propertyId/signage" element={<TVSignage />} />
        <Route path="/pair-tv" element={<PairTV />} />

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
          <Route path="settings/navigation" element={<NavigationSettingsPage />} />
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
          <Route path="settings/tv-devices" element={<TVDevicesSettingsPage />} />
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
          <Route path="reports" element={<AdminReportsPage />} />
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
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="support-tickets" element={<SupportTicketsPage />} />
          <Route path="status" element={<StatusPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

export default AppRoutes;
