const PLATFORM_DOMAIN = 'staymoxie.com';

// Map of subdomain slugs to their custom domains
const SUBDOMAIN_REDIRECTS: Record<string, string> = {
  'moxie': 'www.moxievacationrentals.com',
  // Add more organizations here as they get custom domains
};

export const performDomainRedirect = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Only redirect subdomains of staymoxie.com
  if (!hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    return false;
  }
  
  const subdomain = hostname.replace(`.${PLATFORM_DOMAIN}`, '');
  
  // Check if this subdomain should redirect
  const customDomain = SUBDOMAIN_REDIRECTS[subdomain];
  if (!customDomain) {
    return false;
  }
  
  // Build the redirect URL, preserving path and query string
  const redirectUrl = `https://${customDomain}${window.location.pathname}${window.location.search}${window.location.hash}`;
  
  console.log(`Redirecting from ${hostname} to ${customDomain}`);
  window.location.replace(redirectUrl);
  
  return true;
};
