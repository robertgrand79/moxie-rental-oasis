import React, { createContext, useContext, useMemo } from 'react';

interface PlatformContextType {
  isPlatformSite: boolean;
  isTenantSite: boolean;
  platformDomain: string;
}

const PlatformContext = createContext<PlatformContextType>({
  isPlatformSite: false,
  isTenantSite: true,
  platformDomain: 'staymoxie.com',
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
      hostname === 'staymoxie.com' ||
      hostname === 'www.staymoxie.com' ||
      hostname.includes('staymoxie') ||
      // For development/testing - check URL param
      (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('platform') === 'true');
    
    return {
      isPlatformSite,
      isTenantSite: !isPlatformSite,
      platformDomain: 'staymoxie.com',
    };
  }, []);

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};
