
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://joiovubyokikqjytxtuv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW92dWJ5b2tpa3FqeXR4dHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI0NzY5NCwiZXhwIjoyMDY0ODIzNjk0fQ.H6VWJHOoYwgMhXPoCaOhTaHwQ-LnLb9vKHjgAKjO5rE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchSettingsFromDatabase() {
  try {
    console.log('🔄 Fetching settings from database...');
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('❌ Error fetching settings:', error);
      return null;
    }

    // Convert array of settings to object
    const settingsMap = data.reduce((acc, setting) => {
      try {
        if (setting.key === 'socialMedia') {
          acc[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } else {
          acc[setting.key] = setting.value;
        }
      } catch (parseError) {
        console.warn(`⚠️ Failed to parse setting ${setting.key}:`, parseError);
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {});

    console.log('✅ Settings fetched successfully');
    return settingsMap;
  } catch (error) {
    console.error('❌ Error in fetchSettingsFromDatabase:', error);
    return null;
  }
}

function generateStaticSettingsFile(settings) {
  const defaultSettings = {
    siteName: 'Moxie Vacation Rentals',
    tagline: 'Your Home Base for Living Like a Local in Eugene',
    description: 'Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of the Pacific Northwest.',
    heroTitle: 'Discover Eugene\'s',
    heroSubtitle: 'Hidden Gems',
    heroDescription: 'Experience the Pacific Northwest\'s best-kept secret with our curated collection of luxury vacation rentals in the heart of Oregon\'s cultural capital.',
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

  // Merge database settings with defaults
  const mergedSettings = {
    ...defaultSettings,
    ...settings,
    socialMedia: {
      ...defaultSettings.socialMedia,
      ...(settings.socialMedia || {})
    }
  };

  // Generate the TypeScript file content
  const fileContent = `
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

  return fileContent;
}

async function updateStaticSettingsFile() {
  try {
    const settings = await fetchSettingsFromDatabase();
    
    if (!settings) {
      console.error('❌ Failed to fetch settings from database');
      process.exit(1);
    }

    const fileContent = generateStaticSettingsFile(settings);
    const filePath = path.join(__dirname, '..', 'src', 'contexts', 'StaticSettingsContext.tsx');
    
    fs.writeFileSync(filePath, fileContent);
    
    console.log('✅ StaticSettingsContext.tsx updated successfully!');
    console.log('📸 Hero background image:', settings.heroBackgroundImage || 'default');
    console.log('🚀 Changes will be visible on the published site');
    
  } catch (error) {
    console.error('❌ Error updating static settings file:', error);
    process.exit(1);
  }
}

// Run the update
updateStaticSettingsFile();
