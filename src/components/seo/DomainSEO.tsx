import React from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useTenantDetection } from '@/hooks/useTenantDetection';

interface DomainSEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * SEO component that ensures all meta tags use the correct domain
 * (custom domain if available, otherwise default subdomain)
 */
const DomainSEO: React.FC<DomainSEOProps> = ({
  title,
  description,
  ogImage,
  noindex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
}) => {
  const { settings, loading } = useTenantSettings();
  const { tenant } = useTenantDetection();
  
  if (loading || !tenant) return null;
  
  // Determine the canonical domain
  const canonicalDomain = tenant.custom_domain 
    ? `https://${tenant.custom_domain}`
    : `https://${tenant.slug}.staymoxie.com`;
  
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const canonicalUrl = `${canonicalDomain}${currentPath}`;
  
  // Build page title
  const siteTitle = settings?.siteName || tenant.name || 'StayMoxie';
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Build description
  const metaDescription = description || settings?.metaDescription || settings?.tagline || '';
  
  // Build OG image URL
  const ogImageUrl = ogImage || settings?.ogImage || tenant.logo_url || '';
  const fullOgImage = ogImageUrl?.startsWith('http') 
    ? ogImageUrl 
    : ogImageUrl 
      ? `${canonicalDomain}${ogImageUrl}` 
      : '';
  
  // Build OG title and description
  const ogTitle = settings?.ogTitle || pageTitle;
  const ogDescription = settings?.ogDescription || metaDescription;
  
  React.useEffect(() => {
    // Update document title
    document.title = pageTitle;
    
    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Update or create link tags
    const updateLink = (rel: string, href: string) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]`);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };
    
    // Basic meta tags
    updateMeta('description', metaDescription);
    
    // Canonical URL - critical for SEO with custom domains
    updateLink('canonical', canonicalUrl);
    
    // Robots
    if (noindex) {
      updateMeta('robots', 'noindex,nofollow');
    } else {
      updateMeta('robots', 'index,follow');
    }
    
    // Open Graph tags
    updateMeta('og:title', ogTitle, true);
    updateMeta('og:description', ogDescription, true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', siteTitle, true);
    
    if (fullOgImage) {
      updateMeta('og:image', fullOgImage, true);
      updateMeta('og:image:alt', ogTitle, true);
    }
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', ogTitle);
    updateMeta('twitter:description', ogDescription);
    if (fullOgImage) {
      updateMeta('twitter:image', fullOgImage);
    }
    
    // Article-specific tags
    if (type === 'article') {
      if (publishedTime) {
        updateMeta('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        updateMeta('article:modified_time', modifiedTime, true);
      }
    }
    
  }, [pageTitle, metaDescription, canonicalUrl, ogTitle, ogDescription, fullOgImage, noindex, type, publishedTime, modifiedTime, siteTitle]);
  
  // Return structured data as JSON-LD
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'Organization',
    name: siteTitle,
    url: canonicalDomain,
    ...(tenant.logo_url && { logo: tenant.logo_url }),
    ...(metaDescription && { description: metaDescription }),
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default DomainSEO;
