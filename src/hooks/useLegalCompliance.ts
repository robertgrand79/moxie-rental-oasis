import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ConsentRecord {
  type: 'terms' | 'privacy' | 'marketing' | 'cookies';
  accepted: boolean;
  acceptedAt: string | null;
  version: string;
}

interface UseLegalComplianceReturn {
  consents: ConsentRecord[];
  hasAcceptedTerms: boolean;
  hasAcceptedPrivacy: boolean;
  hasAcceptedMarketing: boolean;
  recordConsent: (type: ConsentRecord['type'], version?: string) => Promise<void>;
  revokeConsent: (type: ConsentRecord['type']) => Promise<void>;
  loading: boolean;
}

const CURRENT_TERMS_VERSION = '1.0.0';
const CURRENT_PRIVACY_VERSION = '1.0.0';

export const useLegalCompliance = (): UseLegalComplianceReturn => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load consent records from localStorage for guests, or database for authenticated users
  useEffect(() => {
    const loadConsents = async () => {
      setLoading(true);
      
      if (user) {
        // Load from database for authenticated users
        try {
          const { data } = await supabase
            .from('profiles')
            .select('terms_accepted_at, privacy_accepted_at, marketing_opt_in')
            .eq('id', user.id)
            .single();

          const profileData = data as any;
          if (profileData) {
            setConsents([
              {
                type: 'terms',
                accepted: !!profileData.terms_accepted_at,
                acceptedAt: profileData.terms_accepted_at,
                version: CURRENT_TERMS_VERSION,
              },
              {
                type: 'privacy',
                accepted: !!profileData.privacy_accepted_at,
                acceptedAt: profileData.privacy_accepted_at,
                version: CURRENT_PRIVACY_VERSION,
              },
              {
                type: 'marketing',
                accepted: !!profileData.marketing_opt_in,
                acceptedAt: profileData.marketing_opt_in ? new Date().toISOString() : null,
                version: '1.0.0',
              },
            ]);
          }
        } catch (error) {
          console.error('Error loading consent records:', error);
        }
      } else {
        // Load from localStorage for guests
        const storedConsents = localStorage.getItem('legal_consents');
        if (storedConsents) {
          try {
            setConsents(JSON.parse(storedConsents));
          } catch {
            setConsents([]);
          }
        }
      }
      
      setLoading(false);
    };

    loadConsents();
  }, [user]);

  const recordConsent = useCallback(async (type: ConsentRecord['type'], version?: string) => {
    const now = new Date().toISOString();
    const consentVersion = version || (type === 'terms' ? CURRENT_TERMS_VERSION : CURRENT_PRIVACY_VERSION);

    if (user) {
      // Save to database for authenticated users
      const updateData: Record<string, any> = {};
      
      if (type === 'terms') {
        updateData.terms_accepted_at = now;
      } else if (type === 'privacy') {
        updateData.privacy_accepted_at = now;
      } else if (type === 'marketing') {
        updateData.marketing_opt_in = true;
      }

      try {
        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
      } catch (error) {
        console.error('Error recording consent:', error);
        throw error;
      }
    }

    // Update local state
    setConsents(prev => {
      const updated = prev.filter(c => c.type !== type);
      updated.push({
        type,
        accepted: true,
        acceptedAt: now,
        version: consentVersion,
      });
      
      // Also save to localStorage as backup
      localStorage.setItem('legal_consents', JSON.stringify(updated));
      
      return updated;
    });
  }, [user]);

  const revokeConsent = useCallback(async (type: ConsentRecord['type']) => {
    if (user) {
      const updateData: Record<string, any> = {};
      
      if (type === 'marketing') {
        updateData.marketing_opt_in = false;
      }
      // Note: terms and privacy consent typically can't be revoked while using the service

      try {
        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
      } catch (error) {
        console.error('Error revoking consent:', error);
        throw error;
      }
    }

    setConsents(prev => {
      const updated = prev.filter(c => c.type !== type);
      updated.push({
        type,
        accepted: false,
        acceptedAt: null,
        version: type === 'terms' ? CURRENT_TERMS_VERSION : CURRENT_PRIVACY_VERSION,
      });
      
      localStorage.setItem('legal_consents', JSON.stringify(updated));
      
      return updated;
    });
  }, [user]);

  const hasAcceptedTerms = consents.some(c => c.type === 'terms' && c.accepted);
  const hasAcceptedPrivacy = consents.some(c => c.type === 'privacy' && c.accepted);
  const hasAcceptedMarketing = consents.some(c => c.type === 'marketing' && c.accepted);

  return {
    consents,
    hasAcceptedTerms,
    hasAcceptedPrivacy,
    hasAcceptedMarketing,
    recordConsent,
    revokeConsent,
    loading,
  };
};
