import React, { useEffect } from 'react';
import { addSecurityHeaders } from '@/utils/enhancedSecurity';

interface SecurityProviderProps {
  children: React.ReactNode;
}

const SecurityProvider = ({ children }: SecurityProviderProps) => {

  useEffect(() => {
    // Add enhanced security headers
    addSecurityHeaders();

    // Set up global error handler for postMessage and WebSocket errors in preview environments
    const handleGlobalError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || '';
      
      // Suppress postMessage-related console errors
      if (errorMessage.includes('postMessage')) {
        event.preventDefault();
        return false;
      }
      
      // Suppress WebSocket SecurityError in preview/iframe environments
      // This happens when Supabase realtime tries to connect in restricted contexts
      if (errorMessage.includes('SecurityError') || 
          errorMessage.includes('The operation is insecure') ||
          (event.error?.name === 'SecurityError')) {
        console.warn('WebSocket connection blocked (preview environment) - realtime features disabled');
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