
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  measurePerformance, 
  preloadCriticalResources, 
  registerServiceWorker,
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

// Register service worker
registerServiceWorker();

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
