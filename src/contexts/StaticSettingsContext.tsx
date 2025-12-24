
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

// Sensible default settings - tenants can customize these
const staticSettings: StaticSettings = {
  siteName: 'Your Vacation Rentals',
  tagline: 'Discover Your Perfect Getaway',
  description: 'Find exceptional vacation rental properties for your next adventure. Book with confidence and create lasting memories.',
  heroTitle: 'Welcome to Your Dream Vacation',
  heroSubtitle: 'Unforgettable Stays Await',
  heroDescription: 'Discover handpicked vacation rentals that offer comfort, style, and unforgettable experiences.',
  heroBackgroundImage: '',
  heroLocationText: 'Your Destination',
  heroRating: '5.0',
  heroCTAText: 'View Properties',
  contactEmail: 'hello@example.com',
  phone: '(555) 123-4567',
  address: '123 Main Street, City, State 12345',
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
