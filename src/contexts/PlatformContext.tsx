import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { debug } from '@/utils/debug';

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
  // Use state + effect to ensure we read window.location AFTER hydration
  // This fixes timing issues where React Router's location.search isn't available on first render
  const [locationSearch, setLocationSearch] = useState('');
  
  useEffect(() => {
    // Read directly from window.location on mount
    setLocationSearch(window.location.search);
    
    // Also listen for popstate to handle browser back/forward
    const handlePopState = () => {
      setLocationSearch(window.location.search);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const value = useMemo(() => {
    if (typeof window === 'undefined') {
      return { isPlatformSite: false, isTenantSite: true, platformDomain: PLATFORM_DOMAIN };
    }

    const hostname = window.location.hostname;
    // Use window.location.search directly as fallback for initial render
    const searchString = locationSearch || window.location.search;
    const urlParams = new URLSearchParams(searchString);
    
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
    // 3. AND no explicit ?org= parameter
    // Subdomains and custom domains are TENANT sites
    const isPlatformSite = 
      forcePlatform ||
      (!isSubdomain && !hasExplicitTenant && (
        hostname === PLATFORM_DOMAIN ||
        hostname === `www.${PLATFORM_DOMAIN}`
      ));
    
    debug.platform('Platform detection:', { 
      hostname, 
      isSubdomain,
      hasExplicitTenant, 
      isPlatformSite,
      forcePlatform,
      search: searchString,
      locationSearchState: locationSearch,
      windowSearch: window.location.search
    });
    
    return {
      isPlatformSite,
      isTenantSite: !isPlatformSite,
      platformDomain: PLATFORM_DOMAIN,
    };
  }, [locationSearch]);

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};
