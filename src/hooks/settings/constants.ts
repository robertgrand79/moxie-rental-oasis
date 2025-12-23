
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
  mapboxToken: '',
  fontPairing: 'playfair-source',
  fontScale: 'default',
  // Email Styling
  emailHeaderColor: '#3b82f6',
  emailHeaderColorEnd: '#1d4ed8',
  emailAccentColor: '#3b82f6',
  emailFooterColor: '#f8fafc',
  // About page
  aboutTitle: '',
  aboutDescription: '',
  aboutImageUrl: '',
  founderNames: '',
  missionStatement: '',
  missionDescription: '',
  // Amenities section
  amenitiesSectionTitle: 'Premium Amenities',
  amenitiesSectionDescription: 'Our properties come thoughtfully equipped with everything you need for a comfortable stay',
  amenitiesSectionEnabled: true,
  
  // Site Colors (stored as hex)
  colorPrimary: '#767b8d',
  colorSecondary: '#8b929a',
  colorAccent: '#cbcfd2',
  colorBackground: '#ffffff',
  colorForeground: '#1a202c',
  colorMuted: '#ececec',
  colorDestructive: '#ef4444',
  
  // Color mode settings
  colorUseGradients: true
};
