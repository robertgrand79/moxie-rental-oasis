import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function is called by a cron job to sync all organizations' PriceLabs data
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const globalPriceLabsKey = Deno.env.get('PRICELABS_API_KEY');

  console.log('Starting scheduled PriceLabs sync for all organizations...');

  try {
    // Get all organizations with PriceLabs API keys configured
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, pricelabs_api_key')
      .not('pricelabs_api_key', 'is', null);

    if (orgError) {
      throw new Error(`Failed to fetch organizations: ${orgError.message}`);
    }

    const results = [];

    // Sync organizations with their own API keys
    for (const org of organizations || []) {
      console.log(`Syncing organization: ${org.name}`);
      
      try {
        // Call the main sync function for this org
        const syncResponse = await fetch(`${supabaseUrl}/functions/v1/sync-pricelabs-pricing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            organization_id: org.id,
            sync_type: 'scheduled'
          })
        });

        const syncResult = await syncResponse.json();
        results.push({
          organization_id: org.id,
          organization_name: org.name,
          ...syncResult
        });
      } catch (orgSyncError) {
        console.error(`Error syncing org ${org.name}:`, orgSyncError);
        results.push({
          organization_id: org.id,
          organization_name: org.name,
          success: false,
          error: orgSyncError.message
        });
      }
    }

    // Also sync properties that use the global API key (no org or org without key)
    if (globalPriceLabsKey) {
      console.log('Syncing properties using global API key...');
      
      // Get properties without org-level API key
      const { data: propertiesWithoutOrgKey } = await supabase
        .from('properties')
        .select(`
          id, 
          title, 
          pricelabs_listing_id,
          organization_id,
          organizations!left(pricelabs_api_key)
        `)
        .not('pricelabs_listing_id', 'is', null);

      const propsNeedingGlobalKey = (propertiesWithoutOrgKey || []).filter(
        p => !p.organization_id || !p.organizations?.pricelabs_api_key
      );

      if (propsNeedingGlobalKey.length > 0) {
        console.log(`Found ${propsNeedingGlobalKey.length} properties using global key`);
        
        // Sync each property individually with global key
        for (const prop of propsNeedingGlobalKey) {
          try {
            const syncResponse = await fetch(`${supabaseUrl}/functions/v1/sync-pricelabs-pricing`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                property_id: prop.id,
                sync_type: 'scheduled'
              })
            });

            const syncResult = await syncResponse.json();
            results.push({
              property_id: prop.id,
              property_title: prop.title,
              ...syncResult
            });
          } catch (propSyncError) {
            console.error(`Error syncing property ${prop.title}:`, propSyncError);
            results.push({
              property_id: prop.id,
              property_title: prop.title,
              success: false,
              error: propSyncError.message
            });
          }
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Scheduled sync completed: ${successCount}/${results.length} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scheduled sync completed: ${successCount}/${results.length} successful`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scheduled PriceLabs sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
