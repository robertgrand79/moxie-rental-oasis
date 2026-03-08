// Platform-wide configuration constants

export const PLATFORM_CONFIG = {
  // Custom Supabase domain for API calls (Edge Functions, etc.)
  API_BASE_URL: 'https://api.staymoxie.com',

  // Lovable project ID - used for direct links to project settings
  // Found in Lovable project URL: https://lovable.dev/projects/{PROJECT_ID}
  LOVABLE_PROJECT_ID: '2d2a89b6-12a5-4c0e-8f4f-a159875a7bce',
  
  // Primary platform domain for tenant subdomains
  PLATFORM_DOMAIN: 'staymoxie.com',
  
  // Lovable dashboard URLs
  LOVABLE_DOMAINS_URL: 'https://lovable.dev/projects/2d2a89b6-12a5-4c0e-8f4f-a159875a7bce/settings/domains',
  LOVABLE_PROJECT_URL: 'https://lovable.dev/projects/2d2a89b6-12a5-4c0e-8f4f-a159875a7bce',
};

// Helper to generate subdomain URL
export const getSubdomainUrl = (slug: string): string => {
  return `${slug}.${PLATFORM_CONFIG.PLATFORM_DOMAIN}`;
};
