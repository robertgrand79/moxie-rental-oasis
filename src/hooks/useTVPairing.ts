import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PairingResult {
  success: boolean;
  device_id?: string;
  property_name?: string;
  message?: string;
  error?: string;
}

export interface PairingInput {
  pairing_code: string;
  email: string;
}

/**
 * useTVPairing - Hook for TV pairing flow (mobile/guest side)
 * 
 * Features:
 * - Validate pairing code
 * - Complete pairing with guest email
 * - Error handling
 */
export const useTVPairing = () => {
  const [isPaired, setIsPaired] = useState(false);
  const [pairingResult, setPairingResult] = useState<PairingResult | null>(null);

  // Validate and complete pairing
  const pairDevice = useMutation<PairingResult, Error, PairingInput>({
    mutationFn: async ({ pairing_code, email }) => {
      const { data, error } = await supabase.functions.invoke('tv-pairing-validate', {
        body: { pairing_code, email },
      });

      if (error) {
        throw new Error(error.message || 'Failed to connect to pairing service');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Invalid or expired pairing code');
      }

      return data as PairingResult;
    },
    onSuccess: (data) => {
      setIsPaired(true);
      setPairingResult(data);
    },
    onError: (error) => {
      setPairingResult({
        success: false,
        error: error.message,
      });
    },
  });

  // Check if a code is valid format
  const isValidCodeFormat = (code: string) => {
    return /^\d{6}$/.test(code);
  };

  // Check if email is valid format
  const isValidEmailFormat = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Reset pairing state
  const reset = () => {
    setIsPaired(false);
    setPairingResult(null);
  };

  return {
    isPaired,
    pairingResult,
    pairDevice,
    isLoading: pairDevice.isPending,
    error: pairDevice.error?.message || pairingResult?.error || null,
    isValidCodeFormat,
    isValidEmailFormat,
    reset,
  };
};

export default useTVPairing;
