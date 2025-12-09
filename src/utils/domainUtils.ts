/**
 * Utility functions for domain-based feature detection
 */

/**
 * Check if the current domain allows admin access
 * Admin access is controlled by authentication and organization membership, not domain
 * @returns boolean indicating if current domain structure supports admin access
 */
export const isAdminDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // All domains support admin access - actual access is controlled by auth
  return true;
};

/**
 * Check if admin features should be visible
 * This is now controlled by OrganizationContext, not domain detection
 * @returns boolean indicating if admin UI elements should be shown
 */
export const shouldShowAdminFeatures = (): boolean => {
  return true;
};

/**
 * Check if the current URL indicates a tenant context
 * @returns the org slug if present, null otherwise
 */
export const getTenantFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('org');
};
