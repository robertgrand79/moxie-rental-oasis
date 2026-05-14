export const PLATFORM_CONFIG = {
  PLATFORM_DOMAIN: 'staymoxie.com',
  VERCEL_DOMAINS_URL: 'https://vercel.com/grandtech/moxie-rental-oasis/settings/domains',
};

export const getSubdomainUrl = (slug: string): string => {
  return `${slug}.${PLATFORM_CONFIG.PLATFORM_DOMAIN}`;
};
