
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PublicLayout from '@/components/layouts/PublicLayout';
import AdminLayoutWrapper from '@/components/layouts/AdminLayoutWrapper';

// Public Pages
import Index from '@/pages/Index';
import Properties from '@/pages/Properties';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import Events from '@/pages/Events';
import Experiences from '@/pages/Experiences';
import Auth from '@/pages/Auth';

// Admin Pages
import Admin from '@/pages/Admin';
import AdminProfile from '@/pages/AdminProfile';
import AdminProperties from '@/pages/admin/AdminProperties';
import AdminPropertyManagement from '@/pages/admin/AdminPropertyManagement';
import AdminTaskManagement from '@/pages/admin/AdminTaskManagement';
import AdminWorkOrders from '@/pages/admin/AdminWorkOrders';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminContractors from '@/pages/admin/AdminContractors';
import EnhancedAdminUserManagement from '@/pages/admin/EnhancedAdminUserManagement';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes wrapped in PublicLayout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Index />} />
          <Route path="properties" element={<Properties />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="blog" element={<Blog />} />
          <Route path="events" element={<Events />} />
          <Route path="experiences" element={<Experiences />} />
        </Route>

        {/* Auth Route (standalone) */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Admin Routes wrapped in AdminLayoutWrapper */}
        <Route path="/admin" element={<AdminLayoutWrapper />}>
          <Route index element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          } />
          
          <Route path="properties" element={
            <ProtectedRoute requiredRole="admin">
              <AdminProperties />
            </ProtectedRoute>
          } />
          
          <Route path="property-management" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPropertyManagement />
            </ProtectedRoute>
          } />
          
          <Route path="tasks" element={
            <ProtectedRoute requiredRole="admin">
              <AdminTaskManagement />
            </ProtectedRoute>
          } />
          
          <Route path="workorders" element={
            <ProtectedRoute requiredRole="admin">
              <AdminWorkOrders />
            </ProtectedRoute>
          } />
          
          <Route path="contractors" element={
            <ProtectedRoute requiredRole="admin">
              <AdminContractors />
            </ProtectedRoute>
          } />
          
          <Route path="analytics" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          
          <Route path="user-management-enhanced" element={
            <ProtectedRoute requiredRole="admin">
              <EnhancedAdminUserManagement />
            </ProtectedRoute>
          } />
        </Route>

        {/* User Profile (non-admin) */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <AdminProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
