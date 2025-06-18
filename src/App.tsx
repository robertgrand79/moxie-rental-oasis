import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import PropertiesPage from './pages/PropertiesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import EventsPage from './pages/EventsPage';
import ExperiencesPage from './pages/ExperiencesPage';
import AdminLayoutWrapper from './components/layouts/AdminLayoutWrapper';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminBlog from './pages/admin/AdminBlog';
import AdminPages from './pages/admin/AdminPages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminRolesPermissions from './pages/admin/AdminRolesPermissions';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSiteMetrics from './pages/admin/AdminSiteMetrics';
import AdminNewsletterManagement from './pages/admin/AdminNewsletterManagement';
import AdminAIContentReview from './pages/admin/AdminAIContentReview';
import AdminAIChat from './pages/admin/AdminAIChat';
import AdminLifestyle from './pages/admin/AdminLifestyle';
import AdminPOI from './pages/admin/AdminPOI';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminEvents from './pages/admin/AdminEvents';
import AdminWorkOrders from './pages/admin/AdminWorkOrders';
import AdminPropertyManagement from './pages/admin/AdminPropertyManagement';
import AdminTaskManagementRedirect from '@/pages/admin/AdminTaskManagementRedirect';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/experiences" element={<ExperiencesPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayoutWrapper />}>
                <Route index element={<AdminDashboard />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="user-management" element={<AdminUserManagement />} />
                <Route path="roles-permissions" element={<AdminRolesPermissions />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="site-metrics" element={<AdminSiteMetrics />} />
                <Route path="newsletter-management" element={<AdminNewsletterManagement />} />
                <Route path="ai-content-review" element={<AdminAIContentReview />} />
                <Route path="ai-chat" element={<AdminAIChat />} />
                <Route path="lifestyle" element={<AdminLifestyle />} />
                <Route path="poi" element={<AdminPOI />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="work-orders" element={<AdminWorkOrders />} />
                <Route path="property-management" element={<AdminPropertyManagement />} />
                
                {/* Redirect old task management to property management */}
                <Route path="task-management" element={<AdminTaskManagementRedirect />} />
                
              </Route>
              
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
