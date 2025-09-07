
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { StaticSettingsProvider } from './contexts/StaticSettingsContext';
import Index from './pages/Index';
import Properties from './pages/Properties';
import PropertyPage from './components/PropertyPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Experiences from './pages/Experiences';
import Events from './pages/Events';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import SearchResults from './pages/SearchResults';
import Auth from './pages/Auth';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQ from './pages/FAQ';
import Listings from './pages/Listings';
import DynamicPage from './components/DynamicPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayoutWrapper from './components/layouts/AdminLayoutWrapper';
import AdminDashboard from './pages/admin/AdminDashboard';
import BlogManagement from './pages/BlogManagement';
import AdminProperties from './pages/admin/AdminProperties';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingCancelledPage from './pages/BookingCancelledPage';
import AdminPageManagement from './pages/admin/AdminPageManagement';
import AdminSiteSettingsRedesigned from './pages/admin/AdminSiteSettingsRedesigned';
import AdminUserAccessManagement from './pages/admin/AdminUserAccessManagement';
import AdminNewsletterManagement from './pages/admin/AdminNewsletterManagement';
import AdminEvents from './pages/admin/AdminEvents';
import AdminPlaces from './pages/admin/AdminPlaces';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminWorkOrders from './pages/admin/AdminWorkOrders';
import AdminContractors from './pages/admin/AdminContractors';
import AdminUnifiedAnalytics from './pages/admin/AdminUnifiedAnalytics';
import HostAnalyticsPage from '@/pages/admin/HostAnalyticsPage';
import HostBookingsPage from '@/pages/admin/HostBookingsPage';
import HostCommunicationPage from '@/pages/admin/HostCommunicationPage';
import GuestPortalPage from '@/pages/guest/GuestPortalPage';
import CheckinPage from '@/pages/guest/CheckinPage';
import GuidebookPage from '@/pages/guest/GuidebookPage';

import AdminProfile from './pages/AdminProfile';
import PublicLayout from './components/layouts/PublicLayout';
import AdminSystemAdministration from './pages/admin/AdminSystemAdministration';
import AdminTurnoProblems from './pages/admin/AdminTurnoProblems';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthProvider>
        <StaticSettingsProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
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

                <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="blog" element={<BlogManagement />} />
                  <Route path="properties" element={<AdminProperties />} />
                  <Route path="pages" element={<AdminPageManagement />} />
                  <Route path="settings" element={<AdminSiteSettingsRedesigned />} />
                  <Route path="user-access-management" element={<AdminUserAccessManagement />} />
                  <Route path="newsletter" element={<AdminNewsletterManagement />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="places" element={<AdminPlaces />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="work-orders" element={<AdminWorkOrders />} />
                  <Route path="contractors" element={<AdminContractors />} />
                  <Route path="turno-problems" element={<AdminTurnoProblems />} />
                  <Route path="analytics" element={<AdminUnifiedAnalytics />} />
                  <Route path="system-administration" element={<AdminSystemAdministration />} />
                  <Route path="host/analytics" element={<HostAnalyticsPage />} />
                  <Route path="host/bookings" element={<HostBookingsPage />} />
                  <Route path="host/communication" element={<HostCommunicationPage />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </QueryClientProvider>
        </StaticSettingsProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
