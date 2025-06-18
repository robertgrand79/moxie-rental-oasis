import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminProfile from '@/pages/AdminProfile';
import UserProfile from '@/pages/UserProfile';
import PropertyManagementDashboard from '@/pages/admin/PropertyManagementDashboard';
import TasksPage from '@/pages/TasksPage';
import ProjectsPage from '@/pages/ProjectsPage';
import PropertiesPage from '@/pages/PropertiesPage';
import CalendarPage from '@/pages/CalendarPage';
import WorkOrdersPage from '@/pages/WorkOrdersPage';
import AdminUserManagement from '@/pages/admin/AdminUserManagement';
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
    return <Navigate to="/login" />;
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        <Route path="/admin/property-management" element={
          <ProtectedRoute requiredRole="admin">
            <PropertyManagementDashboard />
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/properties" element={<ProtectedRoute><PropertiesPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/workorders" element={<ProtectedRoute><WorkOrdersPage /></ProtectedRoute>} />

        <Route
          path="/admin/user-management"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />
          <Route path="/admin/user-management-enhanced" element={
            <ProtectedRoute requiredRole="admin">
              <EnhancedAdminUserManagement />
            </ProtectedRoute>
          } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
