
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import PublicLayout from '@/components/layouts/PublicLayout';
import AdminLayoutWrapper from '@/components/layouts/AdminLayoutWrapper';
import Admin from '@/pages/Admin';
import Properties from '@/pages/Properties';
import Blog from '@/pages/Blog';
import PageManagement from '@/pages/PageManagement';
import SiteSettings from '@/pages/SiteSettings';
import Index from '@/pages/Index';
import BlogPost from '@/pages/BlogPost';
import Auth from '@/pages/Auth';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Events from '@/pages/Events';
import Experiences from '@/pages/Experiences';
import FAQ from '@/pages/FAQ';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import Listings from '@/pages/Listings';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminAIChat from '@/pages/admin/AdminAIChat';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminLifestyle from '@/pages/admin/AdminLifestyle';
import AdminPOI from '@/pages/admin/AdminPOI';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';

function App() {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
            <Toaster />
            <Routes>
              {/* Public routes with PublicLayout */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Index />} />
                <Route path="properties" element={<Properties />} />
                <Route path="listings" element={<Listings />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:id" element={<BlogPost />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="events" element={<Events />} />
                <Route path="experiences" element={<Experiences />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
              </Route>

              {/* Auth route without layout */}
              <Route path="/auth" element={<Auth />} />

              {/* Admin routes with AdminLayout */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<Admin />} />
                <Route path="properties" element={<Properties />} />
                <Route path="blog" element={<Blog />} />
                <Route path="pages" element={<PageManagement />} />
                <Route path="settings" element={<SiteSettings />} />
                <Route path="ai-chat" element={<AdminAIChat />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="lifestyle" element={<AdminLifestyle />} />
                <Route path="poi" element={<AdminPOI />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
              </Route>
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
