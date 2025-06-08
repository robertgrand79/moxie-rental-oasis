
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { 
  measurePerformance, 
  preloadCriticalResources, 
  registerServiceWorker,
  applyAccessibilitySettings,
  ensureTouchTargets
} from './utils/performance';

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
  <AuthProvider>
    <App />
  </AuthProvider>
);
