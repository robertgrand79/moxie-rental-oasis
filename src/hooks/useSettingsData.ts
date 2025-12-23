
import { useState, useEffect } from 'react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

export const useSettingsData = () => {
  const { settings, loading, saveSetting, error } = useSimplifiedSiteSettings();

  const [siteData, setSiteData] = useState({
    siteName: '',
    tagline: '',
    description: '',
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroBackgroundImage: '',
    heroLocationText: '',
    heroCTAText: '',
    contactEmail: '',
    phone: '',
    address: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    },
    emailSetupVerified: false
  });

  const [mapboxToken, setMapboxToken] = useState('');
  const [seoData, setSeoData] = useState({
    siteTitle: '',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    favicon: ''
  });

  const [analyticsData, setAnalyticsData] = useState({
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    customHeaderScripts: '',
    customFooterScripts: '',
    customCss: ''
  });

  // Initialize data from database when settings are loaded
  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      setSiteData({
        siteName: settings.siteName || '',
        tagline: settings.tagline || '',
        description: settings.description || '',
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        heroDescription: settings.heroDescription || '',
        heroBackgroundImage: settings.heroBackgroundImage || '',
        heroLocationText: settings.heroLocationText || '',
        heroCTAText: settings.heroCTAText || 'View Properties',
        contactEmail: settings.contactEmail || '',
        phone: settings.phone || '',
        address: settings.address || '',
        socialMedia: settings.socialMedia || {
          facebook: '',
          instagram: '',
          twitter: '',
          googlePlaces: ''
        },
        emailSetupVerified: settings.emailSetupVerified === 'true' || settings.emailSetupVerified === true
      });
      
      setMapboxToken(settings.mapboxToken || '');
      
      setSeoData({
        siteTitle: settings.siteTitle || '',
        metaDescription: settings.metaDescription || '',
        ogTitle: settings.ogTitle || '',
        ogDescription: settings.ogDescription || '',
        ogImage: settings.ogImage || '',
        favicon: settings.favicon || ''
      });

      setAnalyticsData({
        googleAnalyticsId: settings.googleAnalyticsId || '',
        googleTagManagerId: settings.googleTagManagerId || '',
        facebookPixelId: settings.facebookPixelId || '',
        customHeaderScripts: settings.customHeaderScripts || '',
        customFooterScripts: settings.customFooterScripts || '',
        customCss: settings.customCss || ''
      });
    }
  }, [loading, settings]);

  return {
    siteData,
    setSiteData,
    mapboxToken,
    setMapboxToken,
    seoData,
    setSeoData,
    analyticsData,
    setAnalyticsData,
    updateSetting: saveSetting,
    loading,
    error,
    isUserEditing: false
  };
};
