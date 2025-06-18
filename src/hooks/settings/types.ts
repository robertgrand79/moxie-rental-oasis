
export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SettingsState {
  // Basic site information
  siteName: string;
  tagline: string;
  description: string;
  
  // Hero section with image support
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroBackgroundImage: string;
  heroLocationText: string;
  heroRating: string;
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
  emailVerificationDetails: any;
  
  // SEO settings
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
  
  // Analytics
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  customHeaderScripts: string;
  customFooterScripts: string;
  customCss: string;
  
  // Maps
  mapboxToken: string;
}
