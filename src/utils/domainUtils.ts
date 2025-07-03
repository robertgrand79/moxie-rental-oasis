
/**
 * Utility functions for domain-based feature detection
 */

/**
 * Check if the current domain is the admin domain
 * @returns boolean indicating if current domain allows admin access
 */
export const isAdminDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Allow admin access on production and staging domains
  return hostname === 'moxievacationrentals.com' ||
         hostname === 'www.moxievacationrentals.com' ||
         hostname === 'moxie-rental-oasis.lovable.app' || 
         hostname === 'localhost' || 
         hostname === '127.0.0.1';
};

/**
 * Check if admin features should be visible
 * @returns boolean indicating if admin UI elements should be shown
 */
export const shouldShowAdminFeatures = (): boolean => {
  return isAdminDomain();
};
