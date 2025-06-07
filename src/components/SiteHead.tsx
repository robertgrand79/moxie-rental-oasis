
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useEffect } from 'react';

const SiteHead = () => {
  const { getSetting } = useSiteSettings();

  const siteTitle = getSetting('siteTitle', 'Moxie Vacation Rentals');
  const metaDescription = getSetting('metaDescription', 'Your Home Base for Living Like a Local in Eugene - Discover Eugene, Oregon through thoughtfully curated vacation rentals.');
  const ogTitle = getSetting('ogTitle', siteTitle);
  const ogDescription = getSetting('ogDescription', metaDescription);
  const ogImage = getSetting('ogImage', 'https://lovable.dev/opengraph-image-p98pqg.png');
  const favicon = getSetting('favicon', '/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png');
  const googleAnalyticsId = getSetting('googleAnalyticsId', '');
  const googleTagManagerId = getSetting('googleTagManagerId', '');
  const facebookPixelId = getSetting('facebookPixelId', '');
  const customHeaderScripts = getSetting('customHeaderScripts', '');
  const customFooterScripts = getSetting('customFooterScripts', '');
  const customCss = getSetting('customCss', '');

  useEffect(() => {
    // Update document title
    document.title = siteTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', metaDescription);
    }

    // Update favicon
    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      document.head.appendChild(faviconLink);
    }
    faviconLink.setAttribute('href', favicon);

    // Update Open Graph tags
    let ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute('content', ogTitle);
    }

    let ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescMeta) {
      ogDescMeta.setAttribute('content', ogDescription);
    }

    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', ogImage);
    }

    // Add Google Analytics
    if (googleAnalyticsId && !document.querySelector(`script[src*="${googleAnalyticsId}"]`)) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      const gaConfigScript = document.createElement('script');
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleAnalyticsId}');
      `;
      document.head.appendChild(gaConfigScript);
    }

    // Add Google Tag Manager
    if (googleTagManagerId && !document.querySelector(`script[src*="${googleTagManagerId}"]`)) {
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${googleTagManagerId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // Add Facebook Pixel
    if (facebookPixelId && !document.querySelector(`script[src*="connect.facebook.net"]`)) {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Add custom header scripts
    if (customHeaderScripts) {
      const customScript = document.createElement('script');
      customScript.innerHTML = customHeaderScripts;
      document.head.appendChild(customScript);
    }

    // Add custom CSS
    if (customCss) {
      let customStyle = document.querySelector('#custom-site-css');
      if (!customStyle) {
        customStyle = document.createElement('style');
        customStyle.id = 'custom-site-css';
        document.head.appendChild(customStyle);
      }
      customStyle.innerHTML = customCss;
    }

    // Add custom footer scripts
    if (customFooterScripts) {
      const footerScript = document.createElement('script');
      footerScript.innerHTML = customFooterScripts;
      document.body.appendChild(footerScript);
    }

  }, [siteTitle, metaDescription, ogTitle, ogDescription, ogImage, favicon, googleAnalyticsId, googleTagManagerId, facebookPixelId, customHeaderScripts, customFooterScripts, customCss]);

  return null;
};

export default SiteHead;
