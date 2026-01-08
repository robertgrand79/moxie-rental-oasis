import React, { useEffect } from 'react';
import { addSecurityHeaders } from '@/utils/enhancedSecurity';

interface SecurityProviderProps {
  children: React.ReactNode;
}

// Check if we're in a preview/dev environment where CSP injection causes issues
const isPreviewEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname.includes('lovable.app') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    !import.meta.env.PROD
  );
};

const SecurityProvider = ({ children }: SecurityProviderProps) => {

  useEffect(() => {
    // Only add CSP headers in production (not preview/dev)
    if (!isPreviewEnvironment()) {
      addSecurityHeaders();
    }

    // Set up global error handler for postMessage, WebSocket, and CSP errors in preview environments
    const handleGlobalError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || '';
      
      // Suppress postMessage-related console errors
      if (errorMessage.includes('postMessage')) {
        event.preventDefault();
        return false;
      }
      
      // Suppress WebSocket SecurityError in preview/iframe environments
      if (errorMessage.includes('SecurityError') || 
          errorMessage.includes('The operation is insecure') ||
          (event.error?.name === 'SecurityError')) {
        console.warn('WebSocket connection blocked (preview environment) - realtime features disabled');
        event.preventDefault();
        return false;
      }

      // Suppress CSP and iframe-related errors in preview environments
      if (errorMessage.includes('Content Security Policy') ||
          errorMessage.includes('Loading a manifest') ||
          errorMessage.includes('iframe-pos')) {
        event.preventDefault();
        return false;
      }
    };

    // Also handle unhandled promise rejections for WebSocket errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason?.name === 'SecurityError' || 
          reason?.message?.includes('SecurityError') ||
          reason?.message?.includes('The operation is insecure')) {
        console.warn('WebSocket promise rejected (preview environment) - realtime features disabled');
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
};

export default SecurityProvider;