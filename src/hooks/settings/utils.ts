
import { SettingsState } from './types';

// Map legacy snake_case keys to camelCase
const keyMapping: Record<string, string> = {
  'site_name': 'siteName',
  'logo_url': 'logoUrl',
  'hero_title': 'heroTitle',
  'hero_subtitle': 'heroSubtitle',
  'hero_description': 'heroDescription',
  'hero_background_image': 'heroBackgroundImage',
  'hero_location_text': 'heroLocationText',
  'hero_rating': 'heroRating',
  'hero_cta_text': 'heroCTAText',
  'contact_email': 'contactEmail',
  'social_media': 'socialMedia',
  'site_title': 'siteTitle',
  'meta_description': 'metaDescription',
  'og_title': 'ogTitle',
  'og_description': 'ogDescription',
  'og_image': 'ogImage',
  'google_analytics_id': 'googleAnalyticsId',
  'google_tag_manager_id': 'googleTagManagerId',
  'facebook_pixel_id': 'facebookPixelId',
  'custom_header_scripts': 'customHeaderScripts',
  'custom_footer_scripts': 'customFooterScripts',
  'custom_css': 'customCss',
  'mapbox_token': 'mapboxToken',
  'email_setup_verified': 'emailSetupVerified',
  'email_verification_details': 'emailVerificationDetails',
  'font_pairing': 'fontPairing',
  'font_scale': 'fontScale',
};

const normalizeKey = (key: string): string => {
  return keyMapping[key] || key;
};

export const parseSettingsFromDatabase = (data: any[]): Record<string, any> => {
  console.log('[Settings] Parsing settings from database:', data);
  
  return data?.reduce((acc, setting) => {
    // Normalize the key to camelCase
    const normalizedKey = normalizeKey(setting.key);
    console.log(`[Settings] Processing setting ${setting.key} -> ${normalizedKey}:`, setting.value);
    
    try {
      // For JSONB columns, Supabase already handles JSON parsing
      // We just need to handle specific cases
      if (normalizedKey === 'socialMedia' || normalizedKey === 'emailVerificationDetails') {
        // These should already be objects from JSONB, but handle string case for backward compatibility
        acc[normalizedKey] = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value || {};
      } else if (normalizedKey === 'emailSetupVerified') {
        // Handle boolean conversion - JSONB should preserve boolean type
        if (typeof setting.value === 'boolean') {
          acc[normalizedKey] = setting.value;
        } else {
          // Handle legacy string values
          acc[normalizedKey] = setting.value === 'true' || setting.value === true;
        }
      } else {
        // For other settings, use the value directly (JSONB preserves types)
        acc[normalizedKey] = setting.value;
      }
      
      console.log(`[Settings] Parsed ${normalizedKey}:`, acc[normalizedKey]);
    } catch (parseError) {
      console.error(`[Settings] Failed to parse setting ${normalizedKey}:`, parseError);
      // Fallback to raw value if parsing fails
      acc[normalizedKey] = setting.value;
    }
    return acc;
  }, {} as Record<string, any>) || {};
};

export const mergeWithDefaults = (settingsMap: Record<string, any>, defaultSettings: SettingsState): SettingsState => {
  console.log('[Settings] Merging with defaults:', { settingsMap, defaultSettings });
  
  const merged = {
    ...defaultSettings,
    ...settingsMap,
    socialMedia: {
      ...defaultSettings.socialMedia,
      ...(settingsMap.socialMedia || {})
    },
    emailVerificationDetails: {
      ...defaultSettings.emailVerificationDetails,
      ...(settingsMap.emailVerificationDetails || {})
    }
  };
  
  console.log('[Settings] Merged settings:', merged);
  return merged;
};

// Remove the old serializeSettingValue function as it's now in useSettingsOperations
// This prevents inconsistencies
