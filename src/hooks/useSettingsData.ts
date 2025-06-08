
import { useState, useEffect, useRef } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const useSettingsData = () => {
  const { settings, loading, updateSetting, getSetting, error } = useSiteSettings();
  const isUserEditing = useRef(false);
  const lastLoadedSettings = useRef<any>({});

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

  // Function to mark that user is editing
  const markUserEditing = () => {
    isUserEditing.current = true;
    // Clear the flag after a delay to allow for database updates
    setTimeout(() => {
      isUserEditing.current = false;
    }, 2000);
  };

  // Enhanced setSiteData that marks user editing
  const setSiteDataWithTracking = (updater: any) => {
    markUserEditing();
    setSiteData(updater);
  };

  useEffect(() => {
    console.log('🔄 useSettingsData - loading:', loading, 'settings keys:', Object.keys(settings));
    console.log('👤 User currently editing:', isUserEditing.current);
    
    if (!loading && !isUserEditing.current) {
      const newSiteData = {
        siteName: getSetting('siteName', 'Moxie Vacation Rentals'),
        tagline: getSetting('tagline', 'Your perfect getaway is just a click away.'),
        description: getSetting('description', 'Discover amazing vacation rental properties in prime locations.'),
        heroTitle: getSetting('heroTitle', 'Your Home Away From Home'),
        heroSubtitle: getSetting('heroSubtitle', 'in Eugene'),
        heroDescription: getSetting('heroDescription', 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.'),
        heroBackgroundImage: getSetting('heroBackgroundImage', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2850&q=80'),
        heroLocationText: getSetting('heroLocationText', 'Eugene, Oregon'),
        heroRating: getSetting('heroRating', '4.9'),
        heroCTAText: getSetting('heroCTAText', 'View Properties'),
        contactEmail: getSetting('contactEmail', 'contact@moxievacationrentals.com'),
        phone: getSetting('phone', '+1 (555) 123-4567'),
        address: getSetting('address', '123 Vacation St, Resort City, RC 12345'),
        socialMedia: getSetting('socialMedia', {
          facebook: '',
          instagram: '',
          twitter: '',
          googlePlaces: ''
        })
      };
      
      // Only update if the data actually changed from database
      const hasChanged = JSON.stringify(newSiteData) !== JSON.stringify(lastLoadedSettings.current);
      if (hasChanged) {
        console.log('📊 Setting new site data from database:', newSiteData);
        setSiteData(newSiteData);
        lastLoadedSettings.current = newSiteData;
      }
      
      setMapboxToken(getSetting('mapboxToken', ''));
      
      setSeoData({
        siteTitle: getSetting('siteTitle', 'Moxie Vacation Rentals'),
        metaDescription: getSetting('metaDescription', 'Your Home Base for Living Like a Local in Eugene - Discover Eugene, Oregon through thoughtfully curated vacation rentals.'),
        ogTitle: getSetting('ogTitle', ''),
        ogDescription: getSetting('ogDescription', ''),
        ogImage: getSetting('ogImage', ''),
        favicon: getSetting('favicon', '')
      });

      setAnalyticsData({
        googleAnalyticsId: getSetting('googleAnalyticsId', ''),
        googleTagManagerId: getSetting('googleTagManagerId', ''),
        facebookPixelId: getSetting('facebookPixelId', ''),
        customHeaderScripts: getSetting('customHeaderScripts', ''),
        customFooterScripts: getSetting('customFooterScripts', ''),
        customCss: getSetting('customCss', '')
      });
    }
  }, [loading, settings, getSetting]);

  return {
    siteData,
    setSiteData: setSiteDataWithTracking,
    mapboxToken,
    setMapboxToken,
    seoData,
    setSeoData,
    analyticsData,
    setAnalyticsData,
    updateSetting,
    loading,
    error,
    isUserEditing: isUserEditing.current
  };
};
