
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Admin from '@/pages/Admin';
import Properties from '@/pages/Properties';
import Blog from '@/pages/Blog';
import PageManagement from '@/pages/PageManagement';
import SiteSettings from '@/pages/SiteSettings';
import Index from '@/pages/Index';
import BlogPost from '@/pages/BlogPost';
import Auth from '@/pages/Auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminAIChat from '@/pages/admin/AdminAIChat';

function App() {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/auth" element={<Auth />} />

              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/admin/properties" element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              } />
              <Route path="/admin/blog" element={
                <ProtectedRoute>
                  <Blog />
                </ProtectedRoute>
              } />
              <Route path="/admin/pages" element={
                <ProtectedRoute>
                  <PageManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <SiteSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/ai-chat" element={
                <ProtectedRoute>
                  <AdminAIChat />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
