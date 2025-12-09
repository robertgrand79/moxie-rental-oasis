import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { TenantProvider } from './contexts/TenantContext';
import { StaticSettingsProvider } from './contexts/StaticSettingsContext';
import { PlatformProvider } from './contexts/PlatformContext';
import AppRoutes from './components/routing/AppRoutes';
import PublicChatWidget from './components/public/PublicChatWidget';
import GlobalFontsProvider from './components/GlobalFontsProvider';

// Note: QueryClient is created in main.tsx - single instance for entire app

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PlatformProvider>
        <OrganizationProvider>
          <TenantProvider>
            <StaticSettingsProvider>
              <GlobalFontsProvider>
                <Router>
                  <AppRoutes />
                  <PublicChatWidget />
                </Router>
              </GlobalFontsProvider>
            </StaticSettingsProvider>
          </TenantProvider>
        </OrganizationProvider>
      </PlatformProvider>
    </div>
  );
}

export default App;
