import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminPages from '@/pages/admin/AdminPages';
import AdminNewsletter from '@/pages/admin/AdminNewsletter';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminPOI from '@/pages/admin/AdminPOI';
import AdminLifestyle from '@/pages/admin/AdminLifestyle';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminSiteSettings from '@/pages/admin/AdminSiteSettings';
import AdminAppearance from '@/pages/admin/AdminAppearance';
import AdminIntegrations from '@/pages/admin/AdminIntegrations';
import AdminAITools from '@/pages/admin/AdminAITools';
import PublicHome from '@/pages/PublicHome';
import PublicProperties from '@/pages/PublicProperties';
import PublicPropertyDetails from '@/pages/PublicPropertyDetails';
import PublicBlog from '@/pages/PublicBlog';
import PublicBlogPost from '@/pages/PublicBlogPost';
import PublicPages from '@/pages/PublicPages';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminAIToolsSimplified from '@/pages/admin/AdminAIToolsSimplified';
import AdminAIChat from '@/pages/admin/AdminAIChat';

function App() {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
            <Toaster />
            <Routes>
              <Route path="/" element={<PublicHome />} />
              <Route path="/properties" element={<PublicProperties />} />
              <Route path="/properties/:id" element={<PublicPropertyDetails />} />
              <Route path="/blog" element={<PublicBlog />} />
              <Route path="/blog/:id" element={<PublicBlogPost />} />
              <Route path="/pages/:slug" element={<PublicPages />} />
              <Route path="/login" element={<Login />} />

              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/properties" element={
                <ProtectedRoute>
                  <AdminProperties />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/blog" element={
                <ProtectedRoute>
                  <AdminBlog />
                </ProtectedRoute>
              } />
              <Route path="/admin/pages" element={
                <ProtectedRoute>
                  <AdminPages />
                </ProtectedRoute>
              } />
              <Route path="/admin/newsletter" element={
                <ProtectedRoute>
                  <AdminNewsletter />
                </ProtectedRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedRoute>
                  <AdminEvents />
                </ProtectedRoute>
              } />
              <Route path="/admin/poi" element={
                <ProtectedRoute>
                  <AdminPOI />
                </ProtectedRoute>
              } />
              <Route path="/admin/lifestyle" element={
                <ProtectedRoute>
                  <AdminLifestyle />
                </ProtectedRoute>
              } />
              <Route path="/admin/testimonials" element={
                <ProtectedRoute>
                  <AdminTestimonials />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <AdminSiteSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/appearance" element={
                <ProtectedRoute>
                  <AdminAppearance />
                </ProtectedRoute>
              } />
              <Route path="/admin/integrations" element={
                <ProtectedRoute>
                  <AdminIntegrations />
                </ProtectedRoute>
              } />
              <Route path="/admin/ai-tools" element={
                <ProtectedRoute>
                  <AdminAITools />
                </ProtectedRoute>
              } />
              <Route path="/admin/ai-tools-simplified" element={
                <ProtectedRoute>
                  <AdminAIToolsSimplified />
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
