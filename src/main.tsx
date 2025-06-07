
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { measurePerformance, preloadCriticalResources, registerServiceWorker } from './utils/performance';

// Initialize performance monitoring
measurePerformance();

// Preload critical resources
preloadCriticalResources();

// Register service worker
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
