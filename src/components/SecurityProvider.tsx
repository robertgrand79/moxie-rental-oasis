import React, { useEffect } from 'react';
import { usePostMessageHandler } from '@/hooks/usePostMessageHandler';

interface SecurityProviderProps {
  children: React.ReactNode;
}

const SecurityProvider = ({ children }: SecurityProviderProps) => {
  // Initialize global postMessage handler
  usePostMessageHandler();

  useEffect(() => {
    // Add Content Security Policy via meta tag if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' 
          https://*.hospitable.com 
          https://*.googletagmanager.com 
          https://*.google-analytics.com 
          https://*.facebook.net;
        connect-src 'self' 
          https://*.hospitable.com 
          https://*.google-analytics.com 
          https://*.facebook.com;
        frame-src 'self' 
          https://*.hospitable.com 
          https://booking.hospitable.com;
        img-src 'self' data: 
          https://*.hospitable.com 
          https://*.googletagmanager.com 
          https://*.google-analytics.com 
          https://*.facebook.com;
      `.replace(/\s+/g, ' ').trim();
      
      document.head.appendChild(meta);
    }

    // Set up global error handler for postMessage errors
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('postMessage')) {
        // Suppress postMessage-related console errors
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return <>{children}</>;
};

export default SecurityProvider;