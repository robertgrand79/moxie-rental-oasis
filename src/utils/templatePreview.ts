// Helper for opening template preview links in different environments.
//
// In production, templates may have preview URLs like https://some-tenant.staymoxie.com.
// In Lovable preview environments (and other non-staymoxie hosts), those domains won't resolve.
// We fall back to same-origin tenant preview using ?org=slug, which is supported by PlatformContext/useTenantDetection.

const PLATFORM_DOMAIN = 'staymoxie.com';

const isStayMoxieHost = (hostname: string) => {
  return hostname === PLATFORM_DOMAIN || hostname.endsWith(`.${PLATFORM_DOMAIN}`);
};

const extractSlugFromStayMoxiePreview = (hostname: string) => {
  if (!hostname.endsWith(`.${PLATFORM_DOMAIN}`)) return null;
  const slug = hostname.replace(`.${PLATFORM_DOMAIN}`, '');
  if (!slug || slug === 'www') return null;
  return slug;
};

export const resolveTemplatePreviewUrl = (previewUrl: string): string => {
  try {
    const url = new URL(previewUrl);
    const slug = extractSlugFromStayMoxiePreview(url.hostname);

    // If the preview is a staymoxie subdomain but we're not currently on staymoxie,
    // open the local tenant preview instead.
    if (slug && typeof window !== 'undefined' && !isStayMoxieHost(window.location.hostname)) {
      return `${window.location.origin}/?org=${encodeURIComponent(slug)}`;
    }

    return previewUrl;
  } catch {
    return previewUrl;
  }
};

export const openTemplatePreview = (previewUrl: string) => {
  const resolved = resolveTemplatePreviewUrl(previewUrl);
  window.open(resolved, '_blank', 'noopener,noreferrer');
};
