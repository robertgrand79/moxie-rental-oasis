/**
 * Normalizes site settings keys to handle both camelCase and snake_case conventions.
 * This ensures multi-tenant settings work regardless of which key format was used when saving.
 */
export const normalizeSettingsKeys = (settingsMap: Record<string, any>) => ({
  siteName: settingsMap.siteName || settingsMap.site_name || '',
  description: settingsMap.description || settingsMap.site_description || '',
  contactEmail: settingsMap.contactEmail || settingsMap.contact_email || '',
  phone: settingsMap.phone || settingsMap.contact_phone || '',
  address: settingsMap.address || '',
  heroLocationText: settingsMap.heroLocationText || settingsMap.hero_location_text || '',
  logoUrl: settingsMap.logoUrl || settingsMap.logo_url || '',
  socialMedia: settingsMap.socialMedia || {
    facebook: settingsMap.social_facebook || '',
    instagram: settingsMap.social_instagram || '',
    twitter: settingsMap.social_twitter || '',
  },
});

/**
 * All possible setting keys to query (both camelCase and snake_case)
 */
export const ALL_SETTING_KEYS = [
  'siteName', 'site_name',
  'description', 'site_description',
  'contactEmail', 'contact_email',
  'phone', 'contact_phone',
  'address',
  'heroLocationText', 'hero_location_text',
  'logoUrl', 'logo_url',
  'socialMedia',
  'social_facebook', 'social_instagram', 'social_twitter'
];
