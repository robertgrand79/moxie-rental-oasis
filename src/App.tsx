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
import PageViewTracker from './components/analytics/PageViewTracker';
import CookieConsentBanner from './components/legal/CookieConsentBanner';
import { ErrorBoundary } from './components/ui/error-boundary';
import { WidgetErrorBoundary } from './components/error-boundaries/WidgetErrorBoundary';

// Note: QueryClient is created in main.tsx - single instance for entire app

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        <Router>
          <PlatformProvider>
            <OrganizationProvider>
              <TenantProvider>
                <PageViewTracker>
                  <TenantDebugBanner />
                  <SiteHead />
                  <StaticSettingsProvider>
                    <GlobalThemeProvider>
                      <AppRoutes />
                      <WidgetErrorBoundary widgetName="Chat Widget" silent>
                        <PublicChatWidget />
                      </WidgetErrorBoundary>
                      <WidgetErrorBoundary widgetName="Cookie Consent" silent>
                        <CookieConsentBanner />
                      </WidgetErrorBoundary>
                    </GlobalThemeProvider>
                  </StaticSettingsProvider>
                </PageViewTracker>
              </TenantProvider>
            </OrganizationProvider>
          </PlatformProvider>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;
