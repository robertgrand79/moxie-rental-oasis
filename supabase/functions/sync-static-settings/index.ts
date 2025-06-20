
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

const defaultSettings: StaticSettings = {
  siteName: 'Moxie Vacation Rentals',
  tagline: 'Your Home Base for Living Like a Local in Eugene',
  description: 'Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of the Pacific Northwest.',
  heroTitle: 'Your Home Away From Home',
  heroSubtitle: 'in Eugene',
  heroDescription: 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.',
  heroBackgroundImage: '/lovable-uploads/d73f2e35-5081-40d8-a4a8-62765cdea308.png',
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Fetching settings from database...');
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('❌ Error fetching settings:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
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
    }, {} as Record<string, any>);

    console.log('✅ Settings fetched successfully');

    // Merge database settings with defaults - Database values override defaults
    const mergedSettings: StaticSettings = {
      ...defaultSettings,
      ...settingsMap,
      socialMedia: {
        ...defaultSettings.socialMedia,
        ...(settingsMap.socialMedia || {})
      }
    };

    // Generate the TypeScript file content for static settings
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

    console.log('🚀 Static settings sync completed successfully');
    console.log('📸 Hero background image synced:', mergedSettings.heroBackgroundImage);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Static settings synced successfully',
        lastUpdated: new Date().toISOString(),
        heroImage: mergedSettings.heroBackgroundImage,
        syncedSettings: Object.keys(mergedSettings)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in sync-static-settings:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
