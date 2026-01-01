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
 * Check if a slug is protected
 */
export const isProtectedSlug = (slug: string): boolean => {
  const normalizedSlug = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return PROTECTED_SLUGS.includes(normalizedSlug as ProtectedSlug);
};
