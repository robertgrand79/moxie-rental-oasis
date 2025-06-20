
import { defaultSettings } from './defaults.ts';
import { fetchSettingsFromDatabase, parseSettingsData, mergeWithDefaults } from './database.ts';
import { generateFileContent } from './template.ts';
import { corsHeaders, handleCorsRequest, createSuccessResponse, createErrorResponse } from './cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }

  try {
    // Fetch and parse settings from database
    const data = await fetchSettingsFromDatabase();
    const settingsMap = parseSettingsData(data);

    console.log('✅ Settings fetched successfully');

    // Merge database settings with defaults - Database values override defaults
    const mergedSettings = mergeWithDefaults(settingsMap, defaultSettings);

    // Generate the TypeScript file content for static settings
    const fileContent = generateFileContent(mergedSettings);

    console.log('🚀 Static settings sync completed successfully');
    console.log('📸 Hero background image synced:', mergedSettings.heroBackgroundImage);

    return createSuccessResponse({ 
      success: true, 
      message: 'Static settings synced successfully',
      lastUpdated: new Date().toISOString(),
      heroImage: mergedSettings.heroBackgroundImage,
      syncedSettings: Object.keys(mergedSettings)
    });

  } catch (error) {
    console.error('❌ Error in sync-static-settings:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
