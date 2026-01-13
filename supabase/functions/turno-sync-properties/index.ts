// Properties management endpoint for Turno sync with multi-tenant isolation
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const fetchTurnoProperties = async (token: string, secret: string, partnerId?: string) => {
  try {
    console.log('🏠 Fetching properties from Turno API...');
    
    // Try Bearer token authentication first
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }
    
    let response = await fetch('https://api.turnoverbnb.com/v2/properties', {
      method: 'GET',
      headers,
    });

    // If Bearer fails, try Basic Auth
    if (!response.ok && response.status === 401) {
      console.log('🔄 Bearer failed for properties, trying Basic Auth...');
      const authString = btoa(`${token}:${secret}`);
      headers = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (partnerId) {
        headers['TBNB-Partner-ID'] = partnerId;
      }
      
      response = await fetch('https://api.turnoverbnb.com/v2/properties', {
        method: 'GET',
        headers,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Properties API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Properties API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('📄 Raw Properties API response:', responseText.substring(0, 200) + '...');
    
    if (!responseText.trim()) {
      console.log('⚠️ Empty response from Turno Properties API');
      return {
        success: true,
        data: { data: [] },
        message: 'No properties found (empty response)'
      };
    }

    let propertiesData;
    try {
      propertiesData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error for properties:', parseError);
      console.error('Raw response that failed to parse:', responseText);
      throw new Error(`Invalid JSON response from Turno Properties API: ${parseError.message}`);
    }

    console.log(`✅ Found ${propertiesData.data?.items?.length || propertiesData.data?.length || 0} properties in Turno`);
    
    return {
      success: true,
      data: propertiesData,
      message: `Successfully fetched ${propertiesData.data?.items?.length || propertiesData.data?.length || 0} properties`
    };
  } catch (error) {
    console.error('❌ Error fetching Turno properties:', error);
    return {
      success: false,
      error: `Failed to fetch properties: ${error.message}`
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Turno Properties function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for organization ID
    let organizationId: string | null = null;
    try {
      const body = await req.json();
      organizationId = body.organizationId;
    } catch {
      // No body or invalid JSON
    }

    if (!organizationId) {
      throw new Error('Organization ID is required for Turno property sync');
    }

    console.log('🏢 Syncing Turno properties for organization:', organizationId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch organization's Turno credentials from database
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('turno_api_token, turno_api_secret, turno_partner_id')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      console.error('❌ Failed to fetch organization:', orgError);
      throw new Error('Failed to fetch organization settings');
    }

    // Use organization-level credentials, fall back to global env vars
    const turnoApiToken = org?.turno_api_token || Deno.env.get('TURNO_API_TOKEN');
    const turnoApiSecret = org?.turno_api_secret || Deno.env.get('TURNO_API_SECRET');
    const turnoPartnerId = org?.turno_partner_id || Deno.env.get('TURNO_PARTNER_ID');

    if (!turnoApiToken || !turnoApiSecret) {
      throw new Error('Turno API credentials not configured for this organization');
    }

    console.log('🔧 Using Turno credentials:', org?.turno_api_token ? 'organization-level' : 'global fallback');

    // Fetch properties from Turno
    const propertiesResult = await fetchTurnoProperties(turnoApiToken, turnoApiSecret, turnoPartnerId);
    
    if (!propertiesResult.success) {
      throw new Error(propertiesResult.error);
    }

    // Cache properties in database - handle both data.items and data.data structures
    const properties = Array.isArray(propertiesResult.data?.data?.items) 
      ? propertiesResult.data.data.items 
      : Array.isArray(propertiesResult.data?.data) 
        ? propertiesResult.data.data 
        : [];
    
    console.log(`📊 Caching ${properties.length} properties to database for org ${organizationId}...`);
    
    for (const property of properties) {
      try {
        // Use upsert with composite key (turno_property_id + organization_id)
        const { error: upsertError } = await supabaseClient
          .from('turno_property_mapping')
          .upsert({
            turno_property_id: property.id,
            property_name: property.name || property.alias || property.title || `Property ${property.id}`,
            organization_id: organizationId,
            is_active: false // Will be activated when user maps to internal property
          }, {
            onConflict: 'turno_property_id,organization_id',
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error(`Failed to cache property ${property.id}:`, upsertError);
        }
      } catch (error) {
        console.error(`Failed to cache property ${property.id}:`, error);
      }
    }

    console.log('✅ Properties sync completed successfully for organization:', organizationId);

    return new Response(JSON.stringify({
      success: true,
      properties: properties,
      cached: properties.length,
      organizationId: organizationId,
      message: `Successfully fetched and cached ${properties.length} properties`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('❌ Properties sync error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Failed to sync Turno properties'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
