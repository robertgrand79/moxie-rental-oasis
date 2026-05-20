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
  // Social links are consolidated into the canonical socialMedia JSONB
  // object (migration 20260520020000). The legacy social_* keys no
  // longer exist.
  socialMedia: settingsMap.socialMedia || {
    facebook: '',
    instagram: '',
    twitter: '',
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
  'socialMedia'
];
