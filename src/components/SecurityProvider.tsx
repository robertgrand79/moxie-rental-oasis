import React, { useEffect } from 'react';
import { addSecurityHeaders } from '@/utils/enhancedSecurity';

interface SecurityProviderProps {
  children: React.ReactNode;
}

const SecurityProvider = ({ children }: SecurityProviderProps) => {

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