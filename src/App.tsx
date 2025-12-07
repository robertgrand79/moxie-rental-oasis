import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { TenantProvider } from './contexts/TenantContext';
import { StaticSettingsProvider } from './contexts/StaticSettingsContext';
import { PlatformProvider } from './contexts/PlatformContext';
import AppRoutes from './components/routing/AppRoutes';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PlatformProvider>
        <AuthProvider>
          <OrganizationProvider>
            <QueryClientProvider client={queryClient}>
              <TenantProvider>
                <StaticSettingsProvider>
                  <Router>
                    <AppRoutes />
                  </Router>
                </StaticSettingsProvider>
              </TenantProvider>
            </QueryClientProvider>
          </OrganizationProvider>
        </AuthProvider>
      </PlatformProvider>
    </div>
  );
}

export default App;
