import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTurnstileResult {
  token: string | null;
  isVerified: boolean;
  isVerifying: boolean;
  error: string | null;
  handleVerify: (token: string) => void;
  handleError: () => void;
  handleExpire: () => void;
  verifyToken: (token: string) => Promise<boolean>;
  reset: () => void;
}

export const useTurnstile = (): UseTurnstileResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback((newToken: string) => {
    setToken(newToken);
    setIsVerified(true);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setToken(null);
    setIsVerified(false);
    setError('Verification failed. Please try again.');
  }, []);

  const handleExpire = useCallback(() => {
    setToken(null);
    setIsVerified(false);
    setError('Verification expired. Please verify again.');
  }, []);

  const verifyToken = useCallback(async (tokenToVerify: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: tokenToVerify }
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.success) {
        setIsVerified(true);
        return true;
      } else {
        setError(data?.error || 'Verification failed');
        setIsVerified(false);
        return false;
      }
    } catch (err: any) {
      console.error('Turnstile verification error:', err);
      setError('Failed to verify. Please try again.');
      setIsVerified(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setToken(null);
    setIsVerified(false);
    setIsVerifying(false);
    setError(null);
  }, []);

  return {
    token,
    isVerified,
    isVerifying,
    error,
    handleVerify,
    handleError,
    handleExpire,
    verifyToken,
    reset,
  };
};
