import { performDomainRedirect } from './utils/domainRedirect';

// Check for subdomain redirect FIRST, before any React rendering
const isRedirecting = performDomainRedirect();

import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  measurePerformance, 
  preloadCriticalResources, 
  applyAccessibilitySettings
} from './utils/performance';
import { debug } from './utils/debug';
import { errorTracker } from '@/services/monitoring/errorTracker';


// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Only initialize app if not redirecting
if (!isRedirecting) {
  // Initialize performance monitoring
  measurePerformance();

  // Initialize error tracking
  errorTracker.init();

  // Preload critical resources
  preloadCriticalResources();

  // Apply accessibility settings
  applyAccessibilitySettings();

  // Force unregister all service workers and clear caches to fix stale content issues
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
        debug.log('Unregistered service worker:', registration.scope);
      });
    });
    
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
          debug.log('Deleted cache:', name);
        });
      });
    }
  }


  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
