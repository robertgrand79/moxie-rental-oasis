
import { useState, useEffect } from 'react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

export const useSettingsData = () => {
  const { settings, loading, saveSetting, error } = useStableSiteSettings();

  const [siteData, setSiteData] = useState({
    siteName: '',
    tagline: '',
    description: '',
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroBackgroundImage: '',
    heroLocationText: '',
    heroRating: '',
    heroCTAText: '',
    contactEmail: '',
    phone: '',
    address: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    }
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
        siteName: settings.siteName || 'Moxie Vacation Rentals',
        tagline: settings.tagline || 'Your perfect getaway is just a click away.',
        description: settings.description || 'Discover amazing vacation rental properties in prime locations.',
        heroTitle: settings.heroTitle || 'Your Home Away From Home',
        heroSubtitle: settings.heroSubtitle || 'in Eugene',
        heroDescription: settings.heroDescription || 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.',
        heroBackgroundImage: settings.heroBackgroundImage || '',
        heroLocationText: settings.heroLocationText || 'Eugene, Oregon',
        heroRating: settings.heroRating || '4.9',
        heroCTAText: settings.heroCTAText || 'View Properties',
        contactEmail: settings.contactEmail || 'contact@moxievacationrentals.com',
        phone: settings.phone || '+1 (555) 123-4567',
        address: settings.address || '123 Vacation St, Resort City, RC 12345',
        socialMedia: settings.socialMedia || {
          facebook: '',
          instagram: '',
          twitter: '',
          googlePlaces: ''
        }
      });
      
      setMapboxToken(settings.mapboxToken || '');
      
      setSeoData({
        siteTitle: settings.siteTitle || 'Moxie Vacation Rentals',
        metaDescription: settings.metaDescription || 'Your Home Base for Living Like a Local in Eugene - Discover Eugene, Oregon through thoughtfully curated vacation rentals.',
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
