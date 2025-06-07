
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Listings from './pages/Listings';
import SiteSettings from './pages/SiteSettings';
import Admin from './pages/Admin';
import About from './pages/About';
import Experiences from './pages/Experiences';
import Properties from './pages/Properties';
import PageManagement from './pages/PageManagement';
import BlogManagement from './pages/BlogManagement';
import AdminProfile from './pages/AdminProfile';
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
import AIAnalyticsDashboard from '@/components/admin/AIAnalyticsDashboard';
import AdminChatSupport from '@/components/admin/AdminChatSupport';
import ContentApprovalWorkflow from '@/components/admin/ContentApprovalWorkflow';

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
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/" element={<Index />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
              <Route path="/page-management" element={<ProtectedRoute><PageManagement /></ProtectedRoute>} />
              <Route path="/blog-management" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
              <Route path="/site-settings" element={<ProtectedRoute><SiteSettings /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute><AIAnalyticsDashboard /></ProtectedRoute>} />
              <Route path="/admin/chat-support" element={<ProtectedRoute><AdminChatSupport /></ProtectedRoute>} />
              <Route path="/admin/content-approval" element={<ProtectedRoute><ContentApprovalWorkflow /></ProtectedRoute>} />
              
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
