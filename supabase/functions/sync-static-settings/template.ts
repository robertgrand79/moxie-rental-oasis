
import { StaticSettings } from './types.ts';

export const generateFileContent = (mergedSettings: StaticSettings): string => {
  return `
import React, { createContext, useContext, ReactNode } from 'react';

interface StaticSettings {
  siteName: string;
  tagline: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroBackgroundImage: string;
  heroLocationText: string;
  heroRating: string;
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
}

// Static settings fetched from database - updated automatically
// Last updated: ${new Date().toISOString()}
// Hero image: ${mergedSettings.heroBackgroundImage}
const staticSettings: StaticSettings = {
  siteName: ${JSON.stringify(mergedSettings.siteName)},
  tagline: ${JSON.stringify(mergedSettings.tagline)},
  description: ${JSON.stringify(mergedSettings.description)},
  heroTitle: ${JSON.stringify(mergedSettings.heroTitle)},
  heroSubtitle: ${JSON.stringify(mergedSettings.heroSubtitle)},
  heroDescription: ${JSON.stringify(mergedSettings.heroDescription)},
  heroBackgroundImage: ${JSON.stringify(mergedSettings.heroBackgroundImage)},
  heroLocationText: ${JSON.stringify(mergedSettings.heroLocationText)},
  heroRating: ${JSON.stringify(mergedSettings.heroRating)},
  heroCTAText: ${JSON.stringify(mergedSettings.heroCTAText)},
  contactEmail: ${JSON.stringify(mergedSettings.contactEmail)},
  phone: ${JSON.stringify(mergedSettings.phone)},
  address: ${JSON.stringify(mergedSettings.address)},
  socialMedia: {
    facebook: ${JSON.stringify(mergedSettings.socialMedia.facebook)},
    instagram: ${JSON.stringify(mergedSettings.socialMedia.instagram)},
    twitter: ${JSON.stringify(mergedSettings.socialMedia.twitter)},
    googlePlaces: ${JSON.stringify(mergedSettings.socialMedia.googlePlaces)}
  }
};

const StaticSettingsContext = createContext<StaticSettings>(staticSettings);

export const useStaticSettings = () => {
  return useContext(StaticSettingsContext);
};

interface StaticSettingsProviderProps {
  children: ReactNode;
}

export const StaticSettingsProvider = ({ children }: StaticSettingsProviderProps) => {
  return (
    <StaticSettingsContext.Provider value={staticSettings}>
      {children}
    </StaticSettingsContext.Provider>
  );
};
`.trim();
};
