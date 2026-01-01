/**
 * Protected slugs that cannot be used for custom pages.
 * These are reserved for core site pages managed via Settings.
 */
export const PROTECTED_SLUGS = [
  'about',
  'contact',
  'home',
  'faq',
  'privacy-policy',
  'terms-of-service',
  'blog',
  'listings',
  'experiences',
  'search',
  'admin',
  'properties',
  'page-management',
  'blog-management',
  'site-settings',
  'login',
  'signup',
  'register',
  'auth',
  'profile',
  'account',
  'dashboard',
  'tv',
  'guest-portal',
] as const;

export type ProtectedSlug = typeof PROTECTED_SLUGS[number];

/**
 * Path prefixes that should be protected (any slug starting with these)
 */
const PROTECTED_PREFIXES = ['admin', 'auth', 'account', 'dashboard', 'profile'];

/**
 * Check if a slug is protected
 */
export const isProtectedSlug = (slug: string): boolean => {
  const normalizedSlug = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  
  // Empty slug is the home page - protected
  if (normalizedSlug === '') return true;
  
  // Exact match check
  if (PROTECTED_SLUGS.includes(normalizedSlug as ProtectedSlug)) return true;
  
  // Check if slug starts with any protected prefix (e.g., admin/anything)
  for (const prefix of PROTECTED_PREFIXES) {
    if (normalizedSlug.startsWith(`${prefix}/`)) return true;
  }
  
  return false;
};

/**
 * Check if a slug looks like an auto-generated property page (UUID format)
 */
export const isPropertyPageSlug = (slug: string): boolean => {
  const normalizedSlug = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  // UUID pattern check (property pages use property IDs as slugs)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(normalizedSlug);
};
