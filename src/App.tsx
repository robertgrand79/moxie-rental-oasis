import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Listings from './pages/Listings';
import SiteSettings from './pages/SiteSettings';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import SiteHead from '@/components/SiteHead';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SiteHead />
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/site-settings" element={<ProtectedRoute><SiteSettings /></ProtectedRoute>} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/" element={<Index />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
