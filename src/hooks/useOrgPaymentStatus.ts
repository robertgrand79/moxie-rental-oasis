import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrgPaymentStatus {
  payments_enabled: boolean;
  stripe_connect_status: string;
  has_stripe_configured: boolean;
  loading: boolean;
}

export const useOrgPaymentStatus = (organizationId: string | null | undefined): OrgPaymentStatus => {
  const [status, setStatus] = useState<OrgPaymentStatus>({
    payments_enabled: true, // default to true to not block while loading
    stripe_connect_status: 'not_connected',
    has_stripe_configured: false,
    loading: true,
  });

  useEffect(() => {
    if (!organizationId) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('organizations_safe')
        .select('payments_enabled, stripe_connect_status, has_stripe_configured')
        .eq('id', organizationId)
        .single();

      if (!error && data) {
        setStatus({
          payments_enabled: data.payments_enabled || data.has_stripe_configured,
          stripe_connect_status: data.stripe_connect_status || 'not_connected',
          has_stripe_configured: data.has_stripe_configured,
          loading: false,
        });
      } else {
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStatus();
  }, [organizationId]);

  return status;
};
