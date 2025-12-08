import React, { createContext, useContext } from 'react';
import { useTenantDetection } from '@/hooks/useTenantDetection';

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  custom_domain: string | null;
  is_active: boolean;
  template_type: 'single_property' | 'multi_property' | null;
}

interface TenantContextType {
  tenant: TenantInfo | null;
  loading: boolean;
  error: string | null;
  isDefaultTenant: boolean;
  tenantId: string | null;
  isSingleProperty: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

/**
 * TenantProvider detects and provides the current tenant context
 * for public-facing pages based on domain/subdomain.
 */
export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant, loading, error, isDefaultTenant } = useTenantDetection();

  const value: TenantContextType = {
    tenant,
    loading,
    error,
    isDefaultTenant,
    tenantId: tenant?.id ?? null,
    isSingleProperty: tenant?.template_type === 'single_property',
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
