
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './components/layouts/PublicLayout';
import Auth from './pages/Auth';
import Index from './pages/Index';
import Properties from './pages/Properties';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import Events from './pages/Events';
import Experiences from './pages/Experiences';
import FAQ from './pages/FAQ';
import AdminLayoutWrapper from './components/layouts/AdminLayoutWrapper';
import Admin from './pages/Admin';
import AdminProperties from './pages/admin/AdminProperties';
import AdminPageManagement from './pages/admin/AdminPageManagement';
import BlogManagement from './pages/BlogManagement';
import AdminSiteSettingsRedesigned from './pages/admin/AdminSiteSettingsRedesigned';
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
import AdminContractors from './pages/admin/AdminContractors';
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
              {/* Standalone Auth Route */}
              <Route path="/auth" element={<Auth />} />

              {/* Public Routes with PublicLayout */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Index />} />
                <Route path="properties" element={<Properties />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="blog" element={<Blog />} />
                <Route path="events" element={<Events />} />
                <Route path="experiences" element={<Experiences />} />
                <Route path="faq" element={<FAQ />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayoutWrapper />}>
                <Route index element={<Admin />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="blog" element={<BlogManagement />} />
                <Route path="pages" element={<AdminPageManagement />} />
                <Route path="settings" element={<AdminSiteSettingsRedesigned />} />
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
                <Route path="contractors" element={<AdminContractors />} />
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
