import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/services/monitoring/structuredLogger';

export const useSecureApiKeys = () => {
  const [loading, setLoading] = useState(false);

  const getApiKey = async (organizationId: string, keyName: string): Promise<string> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-org-api-key', {
        body: { organizationId, keyName }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to get API key');

      return data.value || '';
    } catch (error) {
      logger.error('Error getting API key', error instanceof Error ? error : undefined, { component: 'SecureApiKeys', keyName });
      return '';
    } finally {
      setLoading(false);
    }
  };

  const setApiKey = async (organizationId: string, keyName: string, value: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('set-org-api-key', {
        body: { organizationId, keyName, value }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to save API key');

      toast.success('API key saved securely');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save API key';
      logger.error('Error setting API key', error instanceof Error ? error : undefined, { component: 'SecureApiKeys', keyName });
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const encryptExistingKeys = async (): Promise<{ encrypted: number; skipped: number }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('encrypt-org-api-keys');

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to encrypt keys');

      toast.success(`Encrypted ${data.encrypted} API keys`);
      return { encrypted: data.encrypted, skipped: data.skipped };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to encrypt API keys';
      logger.error('Error encrypting keys', error instanceof Error ? error : undefined, { component: 'SecureApiKeys' });
      toast.error(errorMessage);
      return { encrypted: 0, skipped: 0 };
    } finally {
      setLoading(false);
    }
  };

  return {
    getApiKey,
    setApiKey,
    encryptExistingKeys,
    loading
  };
};
