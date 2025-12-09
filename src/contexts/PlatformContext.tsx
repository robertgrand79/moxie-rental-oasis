import React, { createContext, useContext, useMemo } from 'react';

// Platform domain configuration
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
    if (typeof window === 'undefined') {
      return { isPlatformSite: false, isTenantSite: true, platformDomain: PLATFORM_DOMAIN };
    }

    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for explicit tenant indicator via ?org= parameter
    const hasExplicitTenant = !!urlParams.get('org');
    
    // Check for explicit platform mode
    const forcePlatform = urlParams.get('platform') === 'true';
    
    // Determine if this is the platform site:
    // 1. staymoxie.com or www.staymoxie.com
    // 2. Lovable preview URL WITHOUT explicit tenant (?org=) parameter
    // 3. localhost WITHOUT explicit tenant parameter (for dev)
    // 4. Explicit ?platform=true parameter
    const isPlatformSite = 
      forcePlatform ||
      hostname === PLATFORM_DOMAIN ||
      hostname === `www.${PLATFORM_DOMAIN}` ||
      // Lovable preview URL without explicit tenant = Platform site
      (hostname.includes('lovable.app') && !hasExplicitTenant) ||
      // localhost without explicit tenant = Platform site
      ((hostname === 'localhost' || hostname === '127.0.0.1') && !hasExplicitTenant);
    
    console.log('🌐 Platform detection:', { 
      hostname, 
      hasExplicitTenant, 
      isPlatformSite,
      forcePlatform 
    });
    
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
