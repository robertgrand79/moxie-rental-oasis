import type { SettingValue, EmailVerificationDetails } from '@/types/common';

export interface SiteSetting {
  id: string;
  key: string;
  value: SettingValue;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SettingsState {
  // Basic site information
  siteName: string;
  siteLogo: string;
  tagline: string;
  description: string;
  
  // Hero section with image support
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroBackgroundImage: string;
  heroLocationText: string;
  heroCTAText: string;
  
  // Contact information
  contactEmail: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    googlePlaces: string;
  };
  
  // Email settings
  emailFromAddress: string;
  emailFromName: string;
  emailReplyTo: string;
  
  // Email verification tracking
  emailSetupVerified: boolean | string;
  emailLastTestedAt: string | null;
  emailVerificationDetails: EmailVerificationDetails | null;
  
  // SEO settings
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
  keywords: string;
  canonicalBase: string;
  twitterCardType: string;
  twitterSite: string;
  
  // Analytics
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  customHeaderScripts: string;
  customFooterScripts: string;
  customCss: string;
  
  // Maps
  mapboxToken: string;
  
  // Typography
  fontPairing: string;
  fontScale: string;
  
  // Email Styling
  emailHeaderColor: string;
  emailHeaderColorEnd: string;
  emailAccentColor: string;
  emailFooterColor: string;
  
  // About page - Basic
  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl: string;
  founderNames: string;
  missionStatement: string;
  missionDescription: string;
  
  // About page - Extended customization
  aboutHeroSubtitle: string;
  aboutFeatureCards: string; // JSON array of {icon, title, description}
  aboutFounderQuote: string;
  aboutTagline: string;
  aboutTags: string; // comma-separated
  aboutMissionCards: string; // JSON array of {icon, title, description}
  aboutValuesCards: string; // JSON array of {icon, title, description}
  aboutExcellenceTitle: string;
  aboutExcellenceDescription: string;
  aboutAuthenticityTitle: string;
  aboutAuthenticityDescription: string;
  aboutClosingQuote: string;
  
  // Amenities section
  amenitiesSectionTitle: string;
  amenitiesSectionDescription: string;
  amenitiesSectionEnabled: boolean;
  
  // Site Colors (stored as hex, converted to HSL at runtime)
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorForeground: string;
  colorMuted: string;
  colorDestructive: string;
  
  // Color mode settings
  colorUseGradients: boolean;
  
  // Owner Travels section
  ownerTravelsTitle: string;
  ownerTravelsDescription: string;
  ownerTravelsImageUrl: string;
  ownerTravelsEnabled: string;
  
  // Video & Social Feed URLs
  youtubeVideoUrl: string;
  tiktokProfileUrl: string;
  instagramFeedUrl: string;
}
