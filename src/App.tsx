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
import WorkOrderAcknowledgment from './pages/WorkOrderAcknowledgment';
import DynamicPage from './components/DynamicPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayoutWrapper from './components/layouts/AdminLayoutWrapper';
import AdminDashboard from './pages/admin/AdminDashboard';
import BlogManagement from './pages/BlogManagement';
import AdminProperties from './pages/admin/AdminProperties';
import AdminPageManagement from './pages/admin/AdminPageManagement';
import AdminSiteSettingsRedesigned from './pages/admin/AdminSiteSettingsRedesigned';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminRolesPermissions from './pages/admin/AdminRolesPermissions';
import AdminNewsletterManagement from './pages/admin/AdminNewsletterManagement';
import AdminEvents from './pages/admin/AdminEvents';
import AdminPOI from './pages/admin/AdminPOI';
import AdminLifestyle from './pages/admin/AdminLifestyle';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminWorkOrders from './pages/admin/AdminWorkOrders';
import AdminContractors from './pages/admin/AdminContractors';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSiteMetrics from './pages/admin/AdminSiteMetrics';
import SampleDataManagement from './pages/SampleDataManagement';
import AdminProfile from './pages/AdminProfile';
import PublicLayout from './components/layouts/PublicLayout';
import AdminImageOptimization from './pages/admin/AdminImageOptimization';

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
                  <Route path="/work-order-acknowledgment/:token" element={<WorkOrderAcknowledgment />} />
                  <Route path="/:slug" element={<DynamicPage />} />
                </Route>

                <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="blog" element={<BlogManagement />} />
                  <Route path="properties" element={<AdminProperties />} />
                  <Route path="pages" element={<AdminPageManagement />} />
                  <Route path="settings" element={<AdminSiteSettingsRedesigned />} />
                  <Route path="users" element={<AdminUserManagement />} />
                  <Route path="roles" element={<AdminRolesPermissions />} />
                  <Route path="newsletter" element={<AdminNewsletterManagement />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="poi" element={<AdminPOI />} />
                  <Route path="lifestyle" element={<AdminLifestyle />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="work-orders" element={<AdminWorkOrders />} />
                  <Route path="contractors" element={<AdminContractors />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="metrics" element={<AdminSiteMetrics />} />
                  <Route path="sample-data" element={<SampleDataManagement />} />
                  <Route path="image-optimization" element={<AdminImageOptimization />} />
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
