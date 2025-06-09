import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayoutWrapper } from '@/components/admin/AdminLayoutWrapper';

// Public Pages
import Index from '@/pages/Index';
import About from '@/pages/About';
import Properties from '@/pages/Properties';
import PropertyPage from '@/pages/PropertyPage';
import Listings from '@/pages/Listings';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Events from '@/pages/Events';
import Experiences from '@/pages/Experiences';
import SearchResults from '@/pages/SearchResults';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import FAQ from '@/pages/FAQ';
import NotFound from '@/pages/NotFound';

// Auth Pages
import Auth from '@/pages/Auth';

// Admin Pages
import Admin from '@/pages/admin/Admin';
import AdminProfile from '@/pages/admin/AdminProfile';
import AdminSiteSettingsRedesigned from '@/pages/admin/AdminSiteSettingsRedesigned';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminNewsletter from '@/pages/admin/AdminNewsletter';
import AdminPageManagement from '@/pages/admin/AdminPageManagement';
import AdminNewsletterManagement from '@/pages/admin/AdminNewsletterManagement';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminLifestyle from '@/pages/admin/AdminLifestyle';
import AdminPOI from '@/pages/admin/AdminPOI';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminTaskManagement from '@/pages/admin/AdminTaskManagement';
import AdminWorkOrders from '@/pages/admin/AdminWorkOrders';
import AdminSiteMetrics from '@/pages/admin/AdminSiteMetrics';
import AdminAIToolsSimplified from '@/pages/admin/AdminAIToolsSimplified';
import AdminContentWorkflows from '@/pages/admin/AdminContentWorkflows';
import AdminAIContentReview from '@/pages/admin/AdminAIContentReview';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminUserPermissions from '@/pages/admin/AdminUserPermissions';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Index />} />
            <Route path="about" element={<About />} />
            <Route path="properties" element={<Properties />} />
            <Route path="properties/:slug" element={<PropertyPage />} />
            <Route path="listings" element={<Listings />} />
            <Route path="contact" element={<Contact />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="events" element={<Events />} />
            <Route path="experiences" element={<Experiences />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="faq" element={<FAQ />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
            <Route index element={<Admin />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSiteSettingsRedesigned />} />
            <Route path="user-permissions" element={<AdminUserPermissions />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="blog" element={<AdminNewsletter />} />
            <Route path="pages" element={<AdminPageManagement />} />
            <Route path="newsletter" element={<AdminNewsletterManagement />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="lifestyle" element={<AdminLifestyle />} />
            <Route path="poi" element={<AdminPOI />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="tasks" element={<AdminTaskManagement />} />
            <Route path="work-orders" element={<AdminWorkOrders />} />
            <Route path="metrics" element={<AdminSiteMetrics />} />
            <Route path="ai-tools" element={<AdminAIToolsSimplified />} />
            <Route path="workflows" element={<AdminContentWorkflows />} />
            <Route path="ai-review" element={<AdminAIContentReview />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
