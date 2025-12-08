
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

// Generic default settings - tenants configure their own values
const staticSettings: StaticSettings = {
  siteName: '',
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
