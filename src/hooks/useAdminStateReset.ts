import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface AdminStateResetOptions {
  onReset: () => void;
  dependencies?: any[];
}

export const useAdminStateReset = ({ onReset, dependencies = [] }: AdminStateResetOptions) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const resetParam = searchParams.get('reset');
    if (resetParam) {
      // Reset all component state to defaults
      onReset();
    }
  }, [searchParams, onReset, ...dependencies]);

  // Return whether we're in a reset state (useful for conditional rendering)
  return {
    isResetting: searchParams.has('reset')
  };
};