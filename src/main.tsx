
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  measurePerformance, 
  preloadCriticalResources, 
  applyAccessibilitySettings,
  ensureTouchTargets
} from './utils/performance';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Initialize performance monitoring
measurePerformance();

// Preload critical resources
preloadCriticalResources();

// Apply accessibility settings
applyAccessibilitySettings();

// Force unregister all service workers and clear caches to fix stale content issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('Unregistered service worker:', registration);
    });
  });
  
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
        console.log('Deleted cache:', name);
      });
    });
  }
}

// Ensure touch targets are properly sized after DOM load
window.addEventListener('load', () => {
  ensureTouchTargets();
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
