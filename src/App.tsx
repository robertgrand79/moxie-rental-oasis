
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
import SiteSettings from '@/pages/SiteSettings';
import AdminContentWorkflows from '@/pages/admin/AdminContentWorkflows';

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
          <Route path="content-workflows" element={<AdminContentWorkflows />} />
          <Route path="ai-tools" element={<AdminAITools />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="settings" element={<SiteSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
