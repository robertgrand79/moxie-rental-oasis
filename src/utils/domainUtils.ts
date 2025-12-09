/**
 * Utility functions for domain-based feature detection
 */

/**
 * Check if the current domain is an admin-enabled domain
 * All domains now support admin access for multi-tenant support
 * @returns boolean indicating if current domain allows admin access
 */
export const isAdminDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // All domains allow admin access in multi-tenant mode
  // Authentication and organization membership control access
  return hostname.includes('lovable.app') || 
         hostname === 'localhost' || 
         hostname === '127.0.0.1' ||
         // Platform domain check
         hostname.includes('staymoxie') ||
         // Allow any custom domain (tenant domains)
         !hostname.includes('localhost');
};

/**
 * Check if admin features should be visible
 * @returns boolean indicating if admin UI elements should be shown
 */
export const shouldShowAdminFeatures = (): boolean => {
  return isAdminDomain();
};
