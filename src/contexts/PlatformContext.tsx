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
    
    // Check if this is a subdomain of staymoxie.com (tenant site)
    const isSubdomain = hostname.endsWith(`.${PLATFORM_DOMAIN}`) && 
                        !hostname.startsWith('www.');
    
    // Platform site ONLY when:
    // 1. Explicit ?platform=true parameter
    // 2. Exactly staymoxie.com or www.staymoxie.com (NOT subdomains like moxie.staymoxie.com)
    // Subdomains and custom domains are TENANT sites
    const isPlatformSite = 
      forcePlatform ||
      (!isSubdomain && !hasExplicitTenant && (
        hostname === PLATFORM_DOMAIN ||
        hostname === `www.${PLATFORM_DOMAIN}`
      ));
    
    console.log('🌐 Platform detection:', { 
      hostname, 
      isSubdomain,
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
