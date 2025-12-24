/**
 * Settings-related type definitions
 */

export interface SocialMediaLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  googlePlaces: string;
}

export interface SiteData {
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
  socialMedia: SocialMediaLinks;
  emailSetupVerified: boolean;
  // About page fields - Basic
  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl: string;
  founderNames: string;
  missionStatement: string;
  missionDescription: string;
  // About page fields - Extended
  aboutHeroSubtitle: string;
  aboutFeatureCards: string;
  aboutFounderQuote: string;
  aboutTagline: string;
  aboutTags: string;
  aboutMissionCards: string;
  aboutValuesCards: string;
  aboutExcellenceTitle: string;
  aboutExcellenceDescription: string;
  aboutAuthenticityTitle: string;
  aboutAuthenticityDescription: string;
  aboutClosingQuote: string;
}

export interface SEOData {
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
}

export interface AnalyticsData {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  customHeaderScripts: string;
  customFooterScripts: string;
  customCss: string;
}

export interface SettingsLocalData {
  siteData: SiteData;
  seoData: SEOData;
  analyticsData: AnalyticsData;
  mapboxToken: string;
}

export type SettingValue = string | number | boolean | object | null;
