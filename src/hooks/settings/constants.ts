
import { SettingsState } from './types';

export const defaultSettings: SettingsState = {
  siteName: '',
  siteLogo: '',
  tagline: '',
  description: '',
  heroTitle: '',
  heroSubtitle: '',
  heroDescription: '',
  heroBackgroundImage: '',
  heroLocationText: '',
  heroRating: '',
  heroCTAText: 'View Properties',
  contactEmail: '',
  phone: '',
  address: '',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    googlePlaces: ''
  },
  emailFromAddress: '',
  emailFromName: '',
  emailReplyTo: '',
  emailSetupVerified: false,
  emailLastTestedAt: null,
  emailVerificationDetails: {},
  siteTitle: '',
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  favicon: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  customHeaderScripts: '',
  customFooterScripts: '',
  customCss: '',
  mapboxToken: ''
};
