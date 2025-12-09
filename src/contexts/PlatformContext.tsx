import React, { createContext, useContext, useMemo } from 'react';

// Platform domain configuration - can be overridden via environment or build config
const PLATFORM_DOMAIN = 'staymoxie.com';

interface PlatformContextType {
  isPlatformSite: boolean;
  isTenantSite: boolean;
  platformDomain: string;
}

const PlatformContext = createContext<PlatformContextType>({
  isPlatformSite: false,
  isTenantSite: true,
  platformDomain: PLATFORM_DOMAIN,
});

export const usePlatform = () => useContext(PlatformContext);

interface PlatformProviderProps {
  children: React.ReactNode;
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ children }) => {
  const value = useMemo(() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    // Check if it's the SaaS marketing domain
    const isPlatformSite = 
      hostname === PLATFORM_DOMAIN ||
      hostname === `www.${PLATFORM_DOMAIN}` ||
      hostname.includes(PLATFORM_DOMAIN.split('.')[0]) ||
      // For development/testing - check URL param
      (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('platform') === 'true');
    
    return {
      isPlatformSite,
      isTenantSite: !isPlatformSite,
      platformDomain: PLATFORM_DOMAIN,
    };
  }, []);

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};
