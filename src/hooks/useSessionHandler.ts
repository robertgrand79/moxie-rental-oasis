import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseSessionHandlerOptions {
  redirectTo?: string;
  onSessionExpired?: () => void;
  onSessionRestored?: () => void;
}

/**
 * Hook to handle session expiry and restoration gracefully
 */
export function useSessionHandler(options: UseSessionHandlerOptions = {}) {
  const { 
    redirectTo = '/auth', 
    onSessionExpired, 
    onSessionRestored 
  } = options;
  
  const navigate = useNavigate();
  const location = useLocation();
  const pendingOperationRef = useRef<string | null>(null);
  const wasLoggedInRef = useRef<boolean>(false);

  // Store the current path when session expires
  const handleSessionExpired = useCallback(() => {
    const currentPath = location.pathname + location.search;
    sessionStorage.setItem('returnTo', currentPath);
    
    toast({
      title: 'Session Expired',
      description: 'Please log in again to continue.',
      variant: 'destructive',
    });

    onSessionExpired?.();
    navigate(redirectTo, { state: { returnTo: currentPath } });
  }, [location, navigate, redirectTo, onSessionExpired]);

  // Restore session and navigate back
  const handleSessionRestored = useCallback(() => {
    const returnTo = sessionStorage.getItem('returnTo');
    sessionStorage.removeItem('returnTo');

    if (returnTo && returnTo !== redirectTo) {
      toast({
        title: 'Welcome Back',
        description: 'Your session has been restored.',
      });
      navigate(returnTo);
    }

    onSessionRestored?.();
  }, [navigate, redirectTo, onSessionRestored]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && wasLoggedInRef.current) {
        handleSessionExpired();
      } else if (event === 'SIGNED_IN' && !wasLoggedInRef.current) {
        handleSessionRestored();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Session token refreshed successfully');
      }

      wasLoggedInRef.current = !!session;
    });

    // Check initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      wasLoggedInRef.current = !!session;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionExpired, handleSessionRestored]);

  // Track pending operations for resuming after re-login
  const setPendingOperation = useCallback((operationId: string | null) => {
    pendingOperationRef.current = operationId;
    if (operationId) {
      sessionStorage.setItem('pendingOperation', operationId);
    } else {
      sessionStorage.removeItem('pendingOperation');
    }
  }, []);

  const getPendingOperation = useCallback(() => {
    return sessionStorage.getItem('pendingOperation');
  }, []);

  const clearPendingOperation = useCallback(() => {
    sessionStorage.removeItem('pendingOperation');
    pendingOperationRef.current = null;
  }, []);

  return {
    setPendingOperation,
    getPendingOperation,
    clearPendingOperation,
  };
}

/**
 * Wrapper for operations that may fail due to session expiry
 */
export async function withSessionCheck<T>(
  operation: () => Promise<T>,
  onSessionExpired: () => void
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a session/auth error
    if (
      errorMessage.includes('JWT') ||
      errorMessage.includes('session') ||
      errorMessage.includes('refresh_token') ||
      errorMessage.includes('not authenticated') ||
      errorMessage.includes('401')
    ) {
      onSessionExpired();
    }
    
    throw error;
  }
}
