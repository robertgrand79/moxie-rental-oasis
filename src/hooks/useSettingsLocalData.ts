
import { useState, useCallback, useEffect } from 'react';
import { SettingsState } from './settings/types';

interface LocalDataState {
  siteData: {
    siteName: string;
    tagline: string;
    description: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroBackgroundImage: string;
    heroLocationText: string;
    heroCTAText: string;
    contactEmail: string;
    phone: string;
    address: string;
    socialMedia: {
      facebook: string;
      instagram: string;
      twitter: string;
      googlePlaces: string;
    };
    emailSetupVerified: boolean;
    // About page fields
    aboutTitle: string;
    aboutDescription: string;
    aboutImageUrl: string;
    founderNames: string;
    missionStatement: string;
    missionDescription: string;
  };
  seoData: {
    siteTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    favicon: string;
  };
  analyticsData: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
    facebookPixelId: string;
    customHeaderScripts: string;
    customFooterScripts: string;
    customCss: string;
  };
  mapboxToken: string;
}

export const useSettingsLocalData = (settings: SettingsState, loading: boolean) => {
  const [localData, setLocalData] = useState<LocalDataState>({
    siteData: {
      siteName: settings.siteName || '',
      tagline: settings.tagline || '',
      description: settings.description || '',
      heroTitle: settings.heroTitle || '',
      heroSubtitle: settings.heroSubtitle || '',
      heroDescription: settings.heroDescription || '',
      heroBackgroundImage: settings.heroBackgroundImage || '',
      heroLocationText: settings.heroLocationText || '',
      heroCTAText: settings.heroCTAText || '',
      contactEmail: settings.contactEmail || '',
      phone: settings.phone || '',
      address: settings.address || '',
      socialMedia: settings.socialMedia || {
        facebook: '',
        instagram: '',
        twitter: '',
        googlePlaces: ''
      },
      emailSetupVerified: Boolean(settings.emailSetupVerified === true || settings.emailSetupVerified === 'true'),
      // About page fields
      aboutTitle: settings.aboutTitle || '',
      aboutDescription: settings.aboutDescription || '',
      aboutImageUrl: settings.aboutImageUrl || '',
      founderNames: settings.founderNames || '',
      missionStatement: settings.missionStatement || '',
      missionDescription: settings.missionDescription || ''
    },
    seoData: {
      siteTitle: settings.siteTitle || '',
      metaDescription: settings.metaDescription || '',
      ogTitle: settings.ogTitle || '',
      ogDescription: settings.ogDescription || '',
      ogImage: settings.ogImage || '',
      favicon: settings.favicon || ''
    },
    analyticsData: {
      googleAnalyticsId: settings.googleAnalyticsId || '',
      googleTagManagerId: settings.googleTagManagerId || '',
      facebookPixelId: settings.facebookPixelId || '',
      customHeaderScripts: settings.customHeaderScripts || '',
      customFooterScripts: settings.customFooterScripts || '',
      customCss: settings.customCss || ''
    },
    mapboxToken: settings.mapboxToken || ''
  });

  const updateLocalDataFromSettings = useCallback(() => {
    if (!loading) {
      console.log('[Settings Page] Updating local data from settings:', settings);
      setLocalData({
        siteData: {
          siteName: settings.siteName || '',
          tagline: settings.tagline || '',
          description: settings.description || '',
          heroTitle: settings.heroTitle || '',
          heroSubtitle: settings.heroSubtitle || '',
          heroDescription: settings.heroDescription || '',
          heroBackgroundImage: settings.heroBackgroundImage || '',
          heroLocationText: settings.heroLocationText || '',
          heroCTAText: settings.heroCTAText || '',
          contactEmail: settings.contactEmail || '',
          phone: settings.phone || '',
          address: settings.address || '',
          socialMedia: settings.socialMedia || {
            facebook: '',
            instagram: '',
            twitter: '',
            googlePlaces: ''
          },
          emailSetupVerified: Boolean(settings.emailSetupVerified === true || settings.emailSetupVerified === 'true'),
          // About page fields
          aboutTitle: settings.aboutTitle || '',
          aboutDescription: settings.aboutDescription || '',
          aboutImageUrl: settings.aboutImageUrl || '',
          founderNames: settings.founderNames || '',
          missionStatement: settings.missionStatement || '',
          missionDescription: settings.missionDescription || ''
        },
        seoData: {
          siteTitle: settings.siteTitle || '',
          metaDescription: settings.metaDescription || '',
          ogTitle: settings.ogTitle || '',
          ogDescription: settings.ogDescription || '',
          ogImage: settings.ogImage || '',
          favicon: settings.favicon || ''
        },
        analyticsData: {
          googleAnalyticsId: settings.googleAnalyticsId || '',
          googleTagManagerId: settings.googleTagManagerId || '',
          facebookPixelId: settings.facebookPixelId || '',
          customHeaderScripts: settings.customHeaderScripts || '',
          customFooterScripts: settings.customFooterScripts || '',
          customCss: settings.customCss || ''
        },
        mapboxToken: settings.mapboxToken || ''
      });
    }
  }, [settings, loading]);

  useEffect(() => {
    updateLocalDataFromSettings();
  }, [updateLocalDataFromSettings]);

  return { localData, setLocalData };
};
