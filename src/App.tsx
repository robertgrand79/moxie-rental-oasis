import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayoutWrapper from '@/layouts/AdminLayoutWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Properties from '@/pages/Properties';
import PropertyDetails from '@/pages/PropertyDetails';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contact from '@/pages/Contact';
import Admin from '@/pages/admin/Admin';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminPropertyEdit from '@/pages/admin/AdminPropertyEdit';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminBlogEdit from '@/pages/admin/AdminBlogEdit';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminTestimonialsEdit from '@/pages/admin/AdminTestimonialsEdit';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminAITools from '@/pages/admin/AdminAITools';
import SiteSettings from '@/pages/SiteSettings';
import AdminContentWorkflows from '@/pages/admin/AdminContentWorkflows';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/properties" element={<PublicLayout><Properties /></PublicLayout>} />
        <Route path="/properties/:id" element={<PublicLayout><PropertyDetails /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/blog/:id" element={<PublicLayout><BlogPost /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayoutWrapper><Admin /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/content-workflows" element={<ProtectedRoute><AdminLayoutWrapper><AdminContentWorkflows /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/ai-tools" element={<ProtectedRoute><AdminLayoutWrapper><AdminAITools /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/properties" element={<ProtectedRoute><AdminLayoutWrapper><AdminProperties /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/properties/:id" element={<ProtectedRoute><AdminLayoutWrapper><AdminPropertyEdit /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/blog" element={<ProtectedRoute><AdminLayoutWrapper><AdminBlog /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/blog/:id" element={<ProtectedRoute><AdminLayoutWrapper><AdminBlogEdit /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/testimonials" element={<ProtectedRoute><AdminLayoutWrapper><AdminTestimonials /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/testimonials/:id" element={<ProtectedRoute><AdminLayoutWrapper><AdminTestimonialsEdit /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminLayoutWrapper><AdminUsers /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminLayoutWrapper><AdminSettings /></AdminLayoutWrapper></ProtectedRoute>} />
        <Route path="/site-settings" element={<ProtectedRoute><AdminLayoutWrapper><SiteSettings /></AdminLayoutWrapper></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
