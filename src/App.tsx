
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PublicLayout from '@/components/layouts/PublicLayout';
import AdminLayoutWrapper from '@/components/layouts/AdminLayoutWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import About from '@/pages/About';
import Properties from '@/pages/Properties';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contact from '@/pages/Contact';
import Auth from '@/pages/Auth';
import Admin from '@/pages/Admin';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminAITools from '@/pages/admin/AdminAITools';
import AdminContentWorkflows from '@/pages/admin/AdminContentWorkflows';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSiteMetrics from '@/pages/admin/AdminSiteMetrics';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminNewsletter from '@/pages/admin/AdminNewsletter';
import AdminNewsletterManagement from '@/pages/admin/AdminNewsletterManagement';
import AdminAIContentReview from '@/pages/admin/AdminAIContentReview';
import AdminSiteSettingsRedesigned from '@/pages/admin/AdminSiteSettingsRedesigned';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminPOI from '@/pages/admin/AdminPOI';
import AdminLifestyle from '@/pages/admin/AdminLifestyle';
import AdminTaskManagement from '@/pages/admin/AdminTaskManagement';
import AdminWorkOrders from '@/pages/admin/AdminWorkOrders';
import AdminUserManagement from '@/pages/admin/AdminUserManagement';
import AdminRolesPermissions from '@/pages/admin/AdminRolesPermissions';
import BlogManagement from '@/pages/BlogManagement';
import PageManagement from '@/pages/PageManagement';
import AdminProfile from '@/pages/AdminProfile';
import SiteSettings from '@/pages/SiteSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Index />} />
          <Route path="about" element={<About />} />
          <Route path="properties" element={<Properties />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        
        {/* Auth Route */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
          <Route index element={<Admin />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="site-metrics" element={<AdminSiteMetrics />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="properties/new" element={<AdminProperties />} />
          <Route path="tasks" element={<AdminTaskManagement />} />
          <Route path="work-orders" element={<AdminWorkOrders />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="poi" element={<AdminPOI />} />
          <Route path="content-workflows" element={<AdminContentWorkflows />} />
          <Route path="ai-tools" element={<AdminAITools />} />
          <Route path="ai-content-review" element={<AdminAIContentReview />} />
          <Route path="pages" element={<PageManagement />} />
          <Route path="blog" element={<BlogManagement />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="newsletter-management" element={<AdminNewsletterManagement />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="lifestyle" element={<AdminLifestyle />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="roles" element={<AdminRolesPermissions />} />
          <Route path="settings" element={<AdminSiteSettingsRedesigned />} />
          <Route path="integrations" element={<SiteSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
