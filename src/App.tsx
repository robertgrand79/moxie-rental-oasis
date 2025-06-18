
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
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />

        <Route
          path="/admin/user-management-enhanced"
          element={
            <ProtectedRoute requiredRole="admin">
              <EnhancedAdminUserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
};

export default App;
