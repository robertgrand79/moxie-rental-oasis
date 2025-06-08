
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Listings from './pages/Listings';
import About from './pages/About';
import Experiences from './pages/Experiences';
import Events from './pages/Events';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import SiteHead from '@/components/SiteHead';
import AdminLayout from '@/components/admin/AdminLayout';
import Admin from './pages/Admin';
import Properties from './pages/Properties';
import PageManagement from './pages/PageManagement';
import BlogManagement from './pages/BlogManagement';
import SiteSettings from './pages/SiteSettings';
import AdminProfile from './pages/AdminProfile';
import SampleDataManagement from './pages/SampleDataManagement';
import AIAnalyticsDashboard from '@/components/admin/AIAnalyticsDashboard';
import AdminChatSupport from '@/components/admin/AdminChatSupport';
import ContentApprovalWorkflow from '@/components/admin/ContentApprovalWorkflow';
import AdminEvents from './pages/admin/AdminEvents';
import AdminPOI from './pages/admin/AdminPOI';
import AdminLifestyle from './pages/admin/AdminLifestyle';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminAITools from './pages/admin/AdminAITools';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SiteHead />
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/events" element={<Events />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/" element={<Index />} />
              
              {/* Protected Admin Routes with AdminLayout */}
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Admin />} />
                <Route path="analytics" element={<AIAnalyticsDashboard />} />
                <Route path="chat-support" element={<AdminChatSupport />} />
                <Route path="content-approval" element={<ContentApprovalWorkflow />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="poi" element={<AdminPOI />} />
                <Route path="lifestyle" element={<AdminLifestyle />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="ai-tools" element={<AdminAITools />} />
                <Route path="sample-data" element={<SampleDataManagement />} />
              </Route>
              
              {/* Standalone Admin Pages (outside AdminLayout for specific reasons) */}
              <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
              <Route path="/page-management" element={<ProtectedRoute><PageManagement /></ProtectedRoute>} />
              <Route path="/blog-management" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
              <Route path="/site-settings" element={<ProtectedRoute><SiteSettings /></ProtectedRoute>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
