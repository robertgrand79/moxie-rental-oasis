import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  
  const value = useMemo(() => {
    if (typeof window === 'undefined') {
      return { isPlatformSite: false, isTenantSite: true, platformDomain: PLATFORM_DOMAIN };
    }

    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(location.search);
    
    // Check for explicit tenant indicator via ?org= parameter
    const hasExplicitTenant = !!urlParams.get('org');
    
    // Check for explicit platform mode
    const forcePlatform = urlParams.get('platform') === 'true';
    
    // Determine if this is the platform site:
    // 1. staymoxie.com or www.staymoxie.com
    // 2. Lovable preview URL WITHOUT explicit tenant (?org=) parameter
    // 3. localhost WITHOUT explicit tenant parameter (for dev)
    // 4. Explicit ?platform=true parameter
    // Platform site only when:
    // 1. Explicit ?platform=true parameter
    // 2. staymoxie.com or www.staymoxie.com domain
    // Lovable preview and localhost now default to TENANT site
    const isPlatformSite = 
      forcePlatform ||
      hostname === PLATFORM_DOMAIN ||
      hostname === `www.${PLATFORM_DOMAIN}`;
    
    console.log('🌐 Platform detection:', { 
      hostname, 
      hasExplicitTenant, 
      isPlatformSite,
      forcePlatform,
      search: location.search
    });
    
    return {
      isPlatformSite,
      isTenantSite: !isPlatformSite,
      platformDomain: PLATFORM_DOMAIN,
    };
  }, [location.search]);

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};
