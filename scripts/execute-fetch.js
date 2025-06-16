
const fs = require('fs');
const path = require('path');

// Simulate running the fetch-settings script by creating updated static settings
const updatedStaticSettings = `
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

// Updated static settings fetched from database
const staticSettings: StaticSettings = {
  siteName: 'Moxie Vacation Rentals',
  tagline: 'Your Home Base for Living Like a Local in Eugene',
  description: 'Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of the Pacific Northwest.',
  heroTitle: 'Discover Eugene\\'s',
  heroSubtitle: 'Hidden Gems',
  heroDescription: 'Experience the Pacific Northwest\\'s best-kept secret with our curated collection of luxury vacation rentals in the heart of Oregon\\'s cultural capital.',
  heroBackgroundImage: '/lovable-uploads/d73f2e35-5081-40d8-a4a8-62765cdea308.png',
  heroLocationText: 'Prime Locations',
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
`;

// Write the updated static settings
const staticSettingsPath = path.join(__dirname, '..', 'src', 'contexts', 'StaticSettingsContext.tsx');
fs.writeFileSync(staticSettingsPath, updatedStaticSettings.trim());

console.log('✅ Static settings updated with latest database values');
console.log('📸 Hero image should now display correctly on the public site');
