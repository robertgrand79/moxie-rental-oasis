
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import AdminProfile from './pages/AdminProfile';
import BlogManagement from './pages/BlogManagement';
import PageManagement from './pages/PageManagement';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPageWrapper from './components/admin/AdminPageWrapper';
import SecurityAuditLog from './components/admin/SecurityAuditLog';
import { AuthProvider } from '@/contexts/EnhancedAuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
          <Route path="/blog-management" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
          <Route path="/page-management" element={<ProtectedRoute><PageManagement /></ProtectedRoute>} />
          <Route path="/admin/audit-log" element={<ProtectedRoute><AdminPageWrapper title="Security Audit Log" description="Monitor security events"><SecurityAuditLog /></AdminPageWrapper></ProtectedRoute>} />

          {/* Redirect any unknown route to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
