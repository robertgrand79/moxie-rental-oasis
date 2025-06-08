
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Admin from '@/pages/Admin';
import Properties from '@/pages/Properties';
import PageManagement from '@/pages/PageManagement';
import BlogManagement from '@/pages/BlogManagement';
import SiteSettings from '@/pages/SiteSettings';
import AdminProfile from '@/pages/AdminProfile';
import AIAnalyticsDashboard from './AIAnalyticsDashboard';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/*" element={<AdminLayout />}>
        <Route index element={<Admin />} />
        <Route path="analytics" element={<AIAnalyticsDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="ai-tools" element={<AIAnalyticsDashboard />} />
        <Route path="chat-support" element={<div className="p-8"><h2>Chat Support Coming Soon</h2></div>} />
        <Route path="events" element={<div className="p-8"><h2>Events Management</h2></div>} />
        <Route path="poi" element={<div className="p-8"><h2>Points of Interest</h2></div>} />
        <Route path="lifestyle" element={<div className="p-8"><h2>Lifestyle Gallery</h2></div>} />
        <Route path="testimonials" element={<div className="p-8"><h2>Testimonials</h2></div>} />
      </Route>
      {/* Routes that don't use the admin layout */}
      <Route path="/properties" element={<Properties />} />
      <Route path="/page-management" element={<PageManagement />} />
      <Route path="/blog-management" element={<BlogManagement />} />
      <Route path="/site-settings" element={<SiteSettings />} />
    </Routes>
  );
};

export default AdminRoutes;
