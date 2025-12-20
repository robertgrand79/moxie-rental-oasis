import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { TenantProvider } from './contexts/TenantContext';
import { StaticSettingsProvider } from './contexts/StaticSettingsContext';
import { PlatformProvider } from './contexts/PlatformContext';
import AppRoutes from './components/routing/AppRoutes';
import PublicChatWidget from './components/public/PublicChatWidget';
import GlobalThemeProvider from './components/GlobalThemeProvider';
import TenantDebugBanner from './components/debug/TenantDebugBanner';
import SiteHead from './components/SiteHead';

// Note: QueryClient is created in main.tsx - single instance for entire app

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        <PlatformProvider>
          <OrganizationProvider>
            <TenantProvider>
              <TenantDebugBanner />
              <SiteHead />
              <StaticSettingsProvider>
                <GlobalThemeProvider>
                  <AppRoutes />
                  <PublicChatWidget />
                </GlobalThemeProvider>
              </StaticSettingsProvider>
            </TenantProvider>
          </OrganizationProvider>
        </PlatformProvider>
      </Router>
    </div>
  );
}

export default App;
