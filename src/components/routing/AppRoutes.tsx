import React, { lazy, Suspense, ComponentType } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';
import { Loader2 } from 'lucide-react';

// Retry wrapper for lazy imports — handles stale chunk failures after deployments
function lazyRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch(() => {
      // Force a full page reload on chunk load failure (stale deploy)
      window.location.reload();
      // Return a never-resolving promise to prevent rendering before reload
      return new Promise<{ default: T }>(() => {});
    })
  );
}

// Minimal loading fallback for lazy-loaded routes
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

// Core public pages (loaded eagerly - critical path for homepage)
import PublicLayout from '@/components/layouts/PublicLayout';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// Lazy-loaded platform pages (only used on platform site)
const PlatformLayout = lazyRetry(() => import('@/components/layouts/PlatformLayout'));
const PlatformHome = lazyRetry(() => import('@/pages/platform/PlatformHome'));
const PlatformAbout = lazyRetry(() => import('@/pages/platform/PlatformAbout'));
const PlatformBlog = lazyRetry(() => import('@/pages/platform/PlatformBlog'));
const PlatformContact = lazyRetry(() => import('@/pages/platform/PlatformContact'));
const PlatformAuth = lazyRetry(() => import('@/pages/platform/PlatformAuth'));
const PlatformSignup = lazyRetry(() => import('@/pages/platform/PlatformSignup'));
const PlatformGetStarted = lazyRetry(() => import('@/pages/platform/PlatformGetStarted'));
const PlatformPrivacy = lazyRetry(() => import('@/pages/platform/PlatformPrivacy'));
const PlatformTerms = lazyRetry(() => import('@/pages/platform/PlatformTerms'));

// Lazy-loaded core pages (not on critical homepage path)
const Properties = lazyRetry(() => import('@/pages/Properties'));
const PropertyPage = lazyRetry(() => import('@/components/PropertyPage'));
const Auth = lazyRetry(() => import('@/pages/Auth'));
const ResetPassword = lazyRetry(() => import('@/pages/ResetPassword'));

// Lazy-loaded public pages
const About = lazyRetry(() => import('@/pages/About'));
const Contact = lazyRetry(() => import('@/pages/Contact'));
const NewsletterWebView = lazyRetry(() => import('@/pages/NewsletterWebView'));
const Experiences = lazyRetry(() => import('@/pages/Experiences'));
const Events = lazyRetry(() => import('@/pages/Events'));
const Blog = lazyRetry(() => import('@/pages/Blog'));
const BlogPost = lazyRetry(() => import('@/pages/BlogPost'));
const SearchResults = lazyRetry(() => import('@/pages/SearchResults'));
const Privacy = lazyRetry(() => import('@/pages/Privacy'));
const Terms = lazyRetry(() => import('@/pages/Terms'));
const FAQ = lazyRetry(() => import('@/pages/FAQ'));
const DataPrivacy = lazyRetry(() => import('@/pages/legal/DataPrivacy'));
const Accessibility = lazyRetry(() => import('@/pages/legal/Accessibility'));
const Listings = lazyRetry(() => import('@/pages/Listings'));
const DynamicPage = lazyRetry(() => import('@/components/DynamicPage'));
const BookingPage = lazyRetry(() => import('@/pages/BookingPage'));
const BookingSuccessPage = lazyRetry(() => import('@/pages/BookingSuccessPage'));
const BookingCancelledPage = lazyRetry(() => import('@/pages/BookingCancelledPage'));
const GuestPortalPage = lazyRetry(() => import('@/pages/guest/GuestPortalPage'));
const CheckinPage = lazyRetry(() => import('@/pages/guest/CheckinPage'));
const GuidebookPage = lazyRetry(() => import('@/pages/guest/GuidebookPage'));
const AcknowledgePage = lazyRetry(() => import('@/pages/AcknowledgePage'));
const ContractorPortal = lazyRetry(() => import('@/pages/ContractorPortal'));
const AcceptInvitation = lazyRetry(() => import('@/pages/AcceptInvitation'));
const StatusPage = lazyRetry(() => import('@/pages/StatusPage'));
const AuthConfirm = lazyRetry(() => import('@/pages/auth/AuthConfirm'));

// Lazy-loaded admin core
import ProtectedRoute from '@/components/ProtectedRoute';
const AdminLayoutWrapper = lazyRetry(() => import('@/components/layouts/AdminLayoutWrapper'));
const AdminDomainGuard = lazyRetry(() => import('@/components/admin/platform/AdminDomainGuard'));
const AdminDashboard = lazyRetry(() => import('@/pages/admin/AdminDashboard'));

// Lazy-loaded admin pages (heavy pages)
const BlogManagement = lazyRetry(() => import('@/pages/BlogManagement'));
const AdminProperties = lazyRetry(() => import('@/pages/admin/AdminProperties'));
const AdminPageManagement = lazyRetry(() => import('@/pages/admin/AdminPageManagement'));
const AdminNewsletterManagement = lazyRetry(() => import('@/pages/admin/AdminNewsletterManagement'));
const AdminEvents = lazyRetry(() => import('@/pages/admin/AdminEvents'));
const AdminPlaces = lazyRetry(() => import('@/pages/admin/AdminPlaces'));
const AdminReviews = lazyRetry(() => import('@/pages/admin/AdminReviews'));
const AdminWorkOrders = lazyRetry(() => import('@/pages/admin/AdminWorkOrders'));
const AdminContractors = lazyRetry(() => import('@/pages/admin/AdminContractors'));
const AdminUnifiedAnalytics = lazyRetry(() => import('@/pages/admin/AdminUnifiedAnalytics'));
const AdminReportsPage = lazyRetry(() => import('@/pages/admin/AdminReportsPage'));
const HostAnalyticsPage = lazyRetry(() => import('@/pages/admin/HostAnalyticsPage'));
const HostBookingsPage = lazyRetry(() => import('@/pages/admin/HostBookingsPage'));
const HostCommunicationPage = lazyRetry(() => import('@/pages/admin/HostCommunicationPage'));
const BookingTimelinePage = lazyRetry(() => import('@/pages/admin/BookingTimelinePage'));
const AdminProfile = lazyRetry(() => import('@/pages/AdminProfile'));
const AdminSystemAdministration = lazyRetry(() => import('@/pages/admin/AdminSystemAdministration'));
const AdminTurnoProblems = lazyRetry(() => import('@/pages/admin/AdminTurnoProblems'));
const AdminPriceLabs = lazyRetry(() => import('@/pages/admin/AdminPriceLabs'));
const GuestExperiencePage = lazyRetry(() => import('@/pages/admin/GuestExperiencePage'));
const AdminChecklists = lazyRetry(() => import('@/pages/admin/AdminChecklists'));
const AdminAIAssistant = lazyRetry(() => import('@/pages/admin/AdminAIAssistant'));
const GuidebookEditorPage = lazyRetry(() => import('@/pages/admin/GuidebookEditorPage'));
const InboxPage = lazyRetry(() => import('@/pages/admin/InboxPage'));
const ConversationDetailPage = lazyRetry(() => import('@/pages/admin/ConversationDetailPage'));
const HelpCenterPage = lazyRetry(() => import('@/pages/admin/HelpCenterPage'));
const MyRequestsPage = lazyRetry(() => import('@/pages/admin/MyRequestsPage'));
const NotificationsPage = lazyRetry(() => import('@/pages/admin/NotificationsPage'));
const OrganizationSignup = lazyRetry(() => import('@/pages/onboarding/OrganizationSignup'));
const OnboardingWizard = lazyRetry(() => import('@/pages/onboarding/OnboardingWizard'));

// Platform Admin pages (new command center) - lazy loaded
const PlatformAdminLayout = lazyRetry(() => import('@/components/admin/platform/PlatformAdminLayout'));
const PlatformDashboard = lazyRetry(() => import('@/components/admin/platform/PlatformDashboard'));
const PlatformOrganizationsPage = lazyRetry(() => import('@/pages/admin/platform/PlatformOrganizationsPage'));
const PlatformUsersPage = lazyRetry(() => import('@/pages/admin/platform/PlatformUsersPage'));
const PlatformTemplatesPage = lazyRetry(() => import('@/pages/admin/platform/PlatformTemplatesPage'));
const PlatformSettingsPage = lazyRetry(() => import('@/pages/admin/platform/PlatformSettingsPage'));
const PlatformMonitoringPage = lazyRetry(() => import('@/pages/admin/platform/PlatformMonitoringPage'));
const PlatformHelpCenterPage = lazyRetry(() => import('@/pages/admin/platform/PlatformHelpCenterPage'));
const PlatformInboxPage = lazyRetry(() => import('@/pages/admin/platform/PlatformInboxPage'));
const PlatformLaunchPage = lazyRetry(() => import('@/pages/admin/platform/PlatformLaunchPage'));
const PlatformAuditPage = lazyRetry(() => import('@/pages/admin/platform/PlatformAuditPage'));
const PlatformLookupPage = lazyRetry(() => import('@/pages/admin/platform/PlatformLookupPage'));
const PlatformTemplateTestPage = lazyRetry(() => import('@/pages/admin/platform/PlatformTemplateTestPage'));
const TaskWorkflowsPage = lazyRetry(() => import('@/pages/admin/platform/TaskWorkflowsPage'));
const PlatformEmailPage = lazyRetry(() => import('@/pages/admin/platform/PlatformEmailPage'));
const PlatformBillingPage = lazyRetry(() => import('@/pages/admin/platform/PlatformBillingPage'));
const PlatformOnboardingPage = lazyRetry(() => import('@/pages/admin/platform/PlatformOnboardingPage'));
const PlatformCommunicationsPage = lazyRetry(() => import('@/pages/admin/platform/PlatformCommunicationsPage'));
const PlatformNotificationsPage = lazyRetry(() => import('@/pages/admin/platform/PlatformNotificationsPage'));
const PlatformRoadmapPage = lazyRetry(() => import('@/pages/admin/platform/PlatformRoadmapPage'));
const PlatformAIPage = lazyRetry(() => import('@/pages/admin/platform/PlatformAIPage'));

// Lazy-loaded settings pages
const GeneralSettingsPage = lazyRetry(() => import('@/pages/admin/settings/GeneralSettingsPage'));
const DomainSettingsPage = lazyRetry(() => import('@/pages/admin/settings/DomainSettingsPage'));
const BillingSettingsPage = lazyRetry(() => import('@/pages/admin/settings/BillingSettingsPage'));
const SiteInfoSettingsPage = lazyRetry(() => import('@/pages/admin/settings/SiteInfoSettingsPage'));
const HeroSettingsPage = lazyRetry(() => import('@/pages/admin/settings/HeroSettingsPage'));
const AboutSettingsPage = lazyRetry(() => import('@/pages/admin/settings/AboutSettingsPage'));
const ContactSettingsPage = lazyRetry(() => import('@/pages/admin/settings/ContactSettingsPage'));
const SEOSettingsPage = lazyRetry(() => import('@/pages/admin/settings/SEOSettingsPage'));
const SocialSettingsPage = lazyRetry(() => import('@/pages/admin/settings/SocialSettingsPage'));
const AnalyticsSettingsPage = lazyRetry(() => import('@/pages/admin/settings/AnalyticsSettingsPage'));
const ColorsSettingsPage = lazyRetry(() => import('@/pages/admin/settings/ColorsSettingsPage'));
const FontsSettingsPage = lazyRetry(() => import('@/pages/admin/settings/FontsSettingsPage'));
const BrandingSettingsPage = lazyRetry(() => import('@/pages/admin/settings/BrandingSettingsPage'));
const UsersSettingsPage = lazyRetry(() => import('@/pages/admin/settings/UsersSettingsPage'));
const RolesSettingsPage = lazyRetry(() => import('@/pages/admin/settings/RolesSettingsPage'));
const NotificationsSettingsPage = lazyRetry(() => import('@/pages/admin/settings/NotificationsSettingsPage'));
const AIAssistantSettingsPage = lazyRetry(() => import('@/pages/admin/settings/AIAssistantSettingsPage'));
const CommunicationsSettingsPage = lazyRetry(() => import('@/pages/admin/settings/CommunicationsSettingsPage'));
const SmartHomeSettingsPage = lazyRetry(() => import('@/pages/admin/settings/SmartHomeSettingsPage'));
const ServicesSettingsPage = lazyRetry(() => import('@/pages/admin/settings/ServicesSettingsPage'));
const StripeSettingsPage = lazyRetry(() => import('@/pages/admin/settings/StripeSettingsPage'));
const PriceLabsSettingsPage = lazyRetry(() => import('@/pages/admin/settings/PriceLabsSettingsPage'));
const SetupWizardPage = lazyRetry(() => import('@/pages/admin/settings/SetupWizardPage'));
const TVDevicesSettingsPage = lazyRetry(() => import('@/pages/admin/settings/TVDevicesSettingsPage'));
const NavigationSettingsPage = lazyRetry(() => import('@/pages/admin/settings/NavigationSettingsPage'));
const TeamSettingsPage = lazyRetry(() => import('@/pages/admin/settings/TeamSettingsPage'));
const PermissionGate = lazyRetry(() => import('@/components/PermissionGate'));

// TV Pages
const TVWelcome = lazyRetry(() => import('@/pages/tv/TVWelcome'));
const TVGuestPortal = lazyRetry(() => import('@/pages/tv/TVGuestPortal'));
const TVSignage = lazyRetry(() => import('@/pages/tv/TVSignage'));
const PairTV = lazyRetry(() => import('@/pages/tv/PairTV'));

const AppRoutes: React.FC = () => {
  const { isPlatformSite, isPlatformAdminDomain } = usePlatform();

  // Admin subdomain (admin.staymoxie.com) - always redirect to Platform Command Center
  if (isPlatformAdminDomain) {
    return (
      <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Redirect root to Platform Command Center */}
        <Route path="/" element={<Navigate to="/admin/platform" replace />} />
        
        {/* Auth routes for login */}
        <Route path="/auth" element={<PlatformAuth />} />
        <Route path="/login" element={<PlatformAuth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        
        {/* Platform Admin Command Center */}
        <Route path="/admin/platform" element={<ProtectedRoute><AdminDomainGuard><PlatformAdminLayout /></AdminDomainGuard></ProtectedRoute>}>
          <Route index element={<PlatformDashboard />} />
          <Route path="organizations" element={<PlatformOrganizationsPage />} />
          <Route path="users" element={<PlatformUsersPage />} />
          <Route path="templates" element={<PlatformTemplatesPage />} />
          <Route path="settings" element={<PlatformSettingsPage />} />
          <Route path="monitoring" element={<PlatformMonitoringPage />} />
          <Route path="help-center" element={<PlatformHelpCenterPage />} />
          <Route path="inbox" element={<PlatformInboxPage />} />
          <Route path="launch" element={<PlatformLaunchPage />} />
          <Route path="audit" element={<PlatformAuditPage />} />
          <Route path="lookup" element={<PlatformLookupPage />} />
          <Route path="template-test" element={<PlatformTemplateTestPage />} />
          <Route path="workflows" element={<TaskWorkflowsPage />} />
          <Route path="email" element={<PlatformEmailPage />} />
          <Route path="billing" element={<PlatformBillingPage />} />
          <Route path="onboarding" element={<PlatformOnboardingPage />} />
          <Route path="communications" element={<PlatformCommunicationsPage />} />
          <Route path="notifications" element={<PlatformNotificationsPage />} />
          <Route path="roadmap" element={<PlatformRoadmapPage />} />
          <Route path="ai" element={<PlatformAIPage />} />
          <Route path="ai-assistant" element={<AdminAIAssistant />} />
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="my-requests" element={<MyRequestsPage />} />
          <Route path="status" element={<StatusPage />} />
        </Route>
        
        {/* Redirect /admin to /admin/platform */}
        <Route path="/admin" element={<Navigate to="/admin/platform" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin/platform" replace />} />
        
        {/* Catch all - redirect to platform command center */}
        <Route path="*" element={<Navigate to="/admin/platform" replace />} />
      </Routes>
      </Suspense>
    );
  }

  if (isPlatformSite) {
    return (
      <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Platform Marketing Routes (staymoxie.com) */}
        <Route path="/" element={<PlatformLayout />}>
            <Route index element={<PlatformHome />} />
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route path="features" element={<Navigate to="/#features" replace />} />
            <Route path="pricing" element={<Navigate to="/#pricing" replace />} />
            <Route path="about" element={<PlatformAbout />} />
            <Route path="contact" element={<PlatformContact />} />
            <Route path="blog" element={<PlatformBlog />} />
            <Route path="privacy" element={<PlatformPrivacy />} />
            <Route path="terms" element={<PlatformTerms />} />
            <Route path="auth" element={<PlatformAuth />} />
            <Route path="login" element={<PlatformAuth />} />
            <Route path="signup" element={<PlatformSignup />} />
            <Route path="get-started" element={<PlatformGetStarted />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Public standalone routes */}
          <Route path="/acknowledge" element={<AcknowledgePage />} />
          <Route path="/contractor/:token" element={<ContractorPortal />} />
          <Route path="/accept-invite" element={<AcceptInvitation />} />
          <Route path="/auth/confirm" element={<AuthConfirm />} />
          <Route path="/status" element={<Navigate to="/admin/status" replace />} />
          <Route path="/newsletter/:id" element={<NewsletterWebView />} />

          {/* TV Routes */}
          <Route path="/tv/:propertyId" element={<TVWelcome />} />
          <Route path="/tv/:propertyId/portal" element={<TVGuestPortal />} />
          <Route path="/tv/:propertyId/signage" element={<TVSignage />} />
          <Route path="/pair-tv" element={<PairTV />} />

          {/* Shared Onboarding Routes */}
          <Route path="/signup" element={<ProtectedRoute><OrganizationSignup /></ProtectedRoute>} />
          <Route path="/admin/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />

          {/* Shared Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDomainGuard><AdminLayoutWrapper /></AdminDomainGuard></ProtectedRoute>}>
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
            <Route path="settings/social" element={<SocialSettingsPage />} />
            <Route path="settings/seo" element={<SEOSettingsPage />} />
            <Route path="settings/analytics" element={<AnalyticsSettingsPage />} />
            <Route path="settings/colors" element={<ColorsSettingsPage />} />
            <Route path="settings/fonts" element={<FontsSettingsPage />} />
            <Route path="settings/branding" element={<BrandingSettingsPage />} />
            <Route path="settings/users" element={<PermissionGate requiredPermission="manage_team"><UsersSettingsPage /></PermissionGate>} />
            <Route path="settings/roles" element={<RolesSettingsPage />} />
            <Route path="settings/notifications-settings" element={<NotificationsSettingsPage />} />
            <Route path="settings/ai-assistant" element={<AIAssistantSettingsPage />} />
            <Route path="settings/communications" element={<CommunicationsSettingsPage />} />
            <Route path="settings/smart-home" element={<SmartHomeSettingsPage />} />
            <Route path="settings/services" element={<ServicesSettingsPage />} />
            <Route path="settings/stripe" element={<PermissionGate requiredPermission="manage_billing"><StripeSettingsPage /></PermissionGate>} />
            <Route path="settings/pricelabs" element={<PriceLabsSettingsPage />} />
            <Route path="settings/tv-devices" element={<TVDevicesSettingsPage />} />
            {/* Redirects for old settings routes */}
            <Route path="settings/organization" element={<Navigate to="/admin/settings/general" replace />} />
            <Route path="settings/site-content" element={<Navigate to="/admin/settings/site-info" replace />} />
            <Route path="settings/appearance" element={<Navigate to="/admin/settings/colors" replace />} />
            <Route path="settings/team" element={<PermissionGate requiredPermission="manage_team"><TeamSettingsPage /></PermissionGate>} />
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
            <Route path="ai-assistant" element={<AdminAIAssistant />} />
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="my-requests" element={<MyRequestsPage />} />
            <Route path="status" element={<StatusPage />} />
            {/* Platform Admin Command Center - nested routes */}
          </Route>
          <Route path="/admin/platform" element={<ProtectedRoute><AdminDomainGuard><PlatformAdminLayout /></AdminDomainGuard></ProtectedRoute>}>
            <Route index element={<PlatformDashboard />} />
            <Route path="organizations" element={<PlatformOrganizationsPage />} />
            <Route path="users" element={<PlatformUsersPage />} />
            <Route path="templates" element={<PlatformTemplatesPage />} />
            <Route path="settings" element={<PlatformSettingsPage />} />
            <Route path="monitoring" element={<PlatformMonitoringPage />} />
            <Route path="help-center" element={<PlatformHelpCenterPage />} />
            <Route path="inbox" element={<PlatformInboxPage />} />
            <Route path="launch" element={<PlatformLaunchPage />} />
            <Route path="audit" element={<PlatformAuditPage />} />
            <Route path="lookup" element={<PlatformLookupPage />} />
            <Route path="template-test" element={<PlatformTemplateTestPage />} />
            <Route path="workflows" element={<TaskWorkflowsPage />} />
            <Route path="ai-assistant" element={<AdminAIAssistant />} />
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="my-requests" element={<MyRequestsPage />} />
            <Route path="status" element={<StatusPage />} />
            <Route path="email" element={<PlatformEmailPage />} />
            <Route path="billing" element={<PlatformBillingPage />} />
            <Route path="onboarding" element={<PlatformOnboardingPage />} />
            <Route path="communications" element={<PlatformCommunicationsPage />} />
            <Route path="roadmap" element={<PlatformRoadmapPage />} />
            <Route path="ai" element={<PlatformAIPage />} />
            <Route path="notifications" element={<PlatformNotificationsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    );
  }

  // Tenant Routes (tenant.lovable.app or custom domains)
  return (
      <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Platform Marketing Routes (accessible via /platform on any domain) */}
        <Route path="/platform" element={<PlatformLayout />}>
          <Route index element={<PlatformHome />} />
          <Route path="features" element={<Navigate to="/platform/#features" replace />} />
          <Route path="pricing" element={<Navigate to="/platform/#pricing" replace />} />
          <Route path="about" element={<PlatformAbout />} />
          <Route path="contact" element={<PlatformContact />} />
          <Route path="blog" element={<PlatformBlog />} />
          <Route path="get-started" element={<PlatformGetStarted />} />
          <Route path="auth" element={<PlatformAuth />} />
          <Route path="signup" element={<PlatformSignup />} />
        </Route>

        {/* Public standalone routes - BEFORE PublicLayout to avoid /:slug catch-all */}
        <Route path="/acknowledge" element={<AcknowledgePage />} />
        <Route path="/contractor/:token" element={<ContractorPortal />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />

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
        <Route path="/status" element={<Navigate to="/admin/status" replace />} />

        {/* TV Routes */}
        <Route path="/tv/:propertyId" element={<TVWelcome />} />
        <Route path="/tv/:propertyId/portal" element={<TVGuestPortal />} />
        <Route path="/tv/:propertyId/signage" element={<TVSignage />} />
        <Route path="/pair-tv" element={<PairTV />} />

        {/* Onboarding Routes */}
        <Route path="/signup" element={<ProtectedRoute><OrganizationSignup /></ProtectedRoute>} />
        <Route path="/admin/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute><AdminDomainGuard><AdminLayoutWrapper /></AdminDomainGuard></ProtectedRoute>}>
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
          <Route path="settings/social" element={<SocialSettingsPage />} />
          <Route path="settings/seo" element={<SEOSettingsPage />} />
          <Route path="settings/analytics" element={<AnalyticsSettingsPage />} />
          <Route path="settings/colors" element={<ColorsSettingsPage />} />
          <Route path="settings/fonts" element={<FontsSettingsPage />} />
          <Route path="settings/branding" element={<BrandingSettingsPage />} />
          <Route path="settings/users" element={<PermissionGate requiredPermission="manage_team"><UsersSettingsPage /></PermissionGate>} />
          <Route path="settings/roles" element={<RolesSettingsPage />} />
          <Route path="settings/notifications-settings" element={<NotificationsSettingsPage />} />
          <Route path="settings/ai-assistant" element={<AIAssistantSettingsPage />} />
          <Route path="settings/communications" element={<CommunicationsSettingsPage />} />
          <Route path="settings/smart-home" element={<SmartHomeSettingsPage />} />
          <Route path="settings/services" element={<ServicesSettingsPage />} />
          <Route path="settings/stripe" element={<PermissionGate requiredPermission="manage_billing"><StripeSettingsPage /></PermissionGate>} />
          <Route path="settings/pricelabs" element={<PriceLabsSettingsPage />} />
          <Route path="settings/tv-devices" element={<TVDevicesSettingsPage />} />
          {/* Redirects for old settings routes */}
          <Route path="settings/organization" element={<Navigate to="/admin/settings/general" replace />} />
          <Route path="settings/site-content" element={<Navigate to="/admin/settings/site-info" replace />} />
          <Route path="settings/appearance" element={<Navigate to="/admin/settings/colors" replace />} />
          <Route path="settings/team" element={<PermissionGate requiredPermission="manage_team"><TeamSettingsPage /></PermissionGate>} />
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
          <Route path="ai-assistant" element={<AdminAIAssistant />} />
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="my-requests" element={<MyRequestsPage />} />
          <Route path="status" element={<StatusPage />} />
          {/* Platform Admin Command Center - nested routes */}
        </Route>
        <Route path="/admin/platform" element={<ProtectedRoute><AdminDomainGuard><PlatformAdminLayout /></AdminDomainGuard></ProtectedRoute>}>
          <Route index element={<PlatformDashboard />} />
          <Route path="organizations" element={<PlatformOrganizationsPage />} />
          <Route path="users" element={<PlatformUsersPage />} />
          <Route path="templates" element={<PlatformTemplatesPage />} />
          <Route path="settings" element={<PlatformSettingsPage />} />
          <Route path="monitoring" element={<PlatformMonitoringPage />} />
          <Route path="help-center" element={<PlatformHelpCenterPage />} />
          <Route path="inbox" element={<PlatformInboxPage />} />
          <Route path="launch" element={<PlatformLaunchPage />} />
          <Route path="audit" element={<PlatformAuditPage />} />
          <Route path="lookup" element={<PlatformLookupPage />} />
          <Route path="template-test" element={<PlatformTemplateTestPage />} />
          <Route path="workflows" element={<TaskWorkflowsPage />} />
          <Route path="email" element={<PlatformEmailPage />} />
          <Route path="billing" element={<PlatformBillingPage />} />
          <Route path="onboarding" element={<PlatformOnboardingPage />} />
          <Route path="communications" element={<PlatformCommunicationsPage />} />
          <Route path="notifications" element={<PlatformNotificationsPage />} />
          <Route path="roadmap" element={<PlatformRoadmapPage />} />
          <Route path="ai" element={<PlatformAIPage />} />
          <Route path="ai-assistant" element={<AdminAIAssistant />} />
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="my-requests" element={<MyRequestsPage />} />
          <Route path="status" element={<StatusPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
  );
};

export default AppRoutes;
