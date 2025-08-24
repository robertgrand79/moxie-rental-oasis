import React, { useEffect } from 'react';
import { usePostMessageHandler } from '@/hooks/usePostMessageHandler';
import { addSecurityHeaders } from '@/utils/enhancedSecurity';

interface SecurityProviderProps {
  children: React.ReactNode;
}

const SecurityProvider = ({ children }: SecurityProviderProps) => {
  // Initialize global postMessage handler
  usePostMessageHandler();

  useEffect(() => {
    // Add enhanced security headers
    addSecurityHeaders();

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