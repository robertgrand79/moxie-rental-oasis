import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { debug } from '@/utils/debug';

// Platform domain configuration
const PLATFORM_DOMAIN = 'staymoxie.com';
const PLATFORM_ADMIN_SUBDOMAIN = 'admin';

interface PlatformContextType {
  isPlatformSite: boolean;
  isTenantSite: boolean;
  platformDomain: string;
  isPlatformAdminDomain: boolean;
}

const PlatformContext = createContext<PlatformContextType>({
  isPlatformSite: false,
  isTenantSite: true,
  platformDomain: PLATFORM_DOMAIN,
  isPlatformAdminDomain: false,
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
      return { isPlatformSite: false, isTenantSite: true, platformDomain: PLATFORM_DOMAIN, isPlatformAdminDomain: false };
    }

    const hostname = window.location.hostname;
    // Use window.location.search directly as fallback for initial render
    const searchString = locationSearch || window.location.search;
    const urlParams = new URLSearchParams(searchString);
    
    // Check for explicit tenant indicator via ?org= parameter
    const hasExplicitTenant = !!urlParams.get('org');
    
    // Check for explicit platform mode
    const forcePlatform = urlParams.get('platform') === 'true';
    
    // Check if this is the dedicated admin subdomain (admin.staymoxie.com)
    const isPlatformAdminDomain = hostname === `${PLATFORM_ADMIN_SUBDOMAIN}.${PLATFORM_DOMAIN}`;
    
    // Check if this is a subdomain of staymoxie.com (tenant site)
    // Exclude admin subdomain from tenant detection
    const isSubdomain = hostname.endsWith(`.${PLATFORM_DOMAIN}`) && 
                        !hostname.startsWith('www.') &&
                        !isPlatformAdminDomain;
    
    // Platform site ONLY when:
    // 1. Explicit ?platform=true parameter
    // 2. admin.staymoxie.com (dedicated platform admin subdomain)
    // 3. Exactly staymoxie.com or www.staymoxie.com (NOT subdomains like moxie.staymoxie.com)
    // 4. AND no explicit ?org= parameter
    // Subdomains and custom domains are TENANT sites
    const isPlatformSite = 
      forcePlatform ||
      isPlatformAdminDomain ||
      (!isSubdomain && !hasExplicitTenant && (
        hostname === PLATFORM_DOMAIN ||
        hostname === `www.${PLATFORM_DOMAIN}`
      ));
    
    debug.platform('Platform detection:', { 
      hostname, 
      isSubdomain,
      isPlatformAdminDomain,
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
      isPlatformAdminDomain,
    };
  }, [locationSearch]);

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};
