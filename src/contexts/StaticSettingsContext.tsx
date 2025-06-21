
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

// Static settings updated to match current database values
const staticSettings: StaticSettings = {
  siteName: 'Moxie Vacation Rentals',
  tagline: 'Your Home Base for Living Like a Local in Eugene',
  description: 'Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of the Pacific Northwest.',
  heroTitle: 'Your Home Away From Home',
  heroSubtitle: 'in Eugene',
  heroDescription: 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.',
  heroBackgroundImage: '',
  heroLocationText: 'Eugene, Oregon',
  heroRating: '4.9',
  heroCTAText: 'View Properties',
  contactEmail: 'contact@moxievacationrentals.com',
  phone: '+1 (555) 123-4567',
  address: '123 Vacation St, Eugene, OR 97401',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    googlePlaces: ''
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
