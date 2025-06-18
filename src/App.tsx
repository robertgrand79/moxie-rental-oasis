
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/pages/Auth';
import AdminProfile from '@/pages/AdminProfile';
import Admin from '@/pages/Admin';
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
        <Route path="/auth" element={<Auth />} />
        
        {/* Main Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Profile */}
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        
        {/* User Profile (non-admin) */}
        <Route path="/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />

        {/* Property Management */}
        <Route
          path="/admin/properties"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProperties />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/property-management"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPropertyManagement />
            </ProtectedRoute>
          }
        />

        {/* Task Management */}
        <Route
          path="/admin/tasks"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTaskManagement />
            </ProtectedRoute>
          }
        />

        {/* Work Orders */}
        <Route
          path="/admin/workorders"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminWorkOrders />
            </ProtectedRoute>
          }
        />

        {/* Contractors */}
        <Route
          path="/admin/contractors"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminContractors />
            </ProtectedRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Enhanced User Management */}
        <Route
          path="/admin/user-management-enhanced"
          element={
            <ProtectedRoute requiredRole="admin">
              <EnhancedAdminUserManagement />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
};

export default App;
