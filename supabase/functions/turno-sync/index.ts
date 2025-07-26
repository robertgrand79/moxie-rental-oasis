import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TurnoApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

const validateApiCredentials = (token: string, secret: string): boolean => {
  return token && token.length > 10 && secret && secret.length > 10;
};

const testTurnoApiConnection = async (token: string, secret: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🔍 Testing Turno API connection...');
    
    // Create basic auth header with token and secret
    const authString = btoa(`${token}:${secret}`);
    
    // Test with a simple API call to verify authentication
    // According to Turno docs, we'll try the properties endpoint first
    const testResponse = await fetch('https://api.turnoverbnb.com/v1/properties', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error(`❌ Turno API test failed: ${testResponse.status} ${testResponse.statusText}`, errorText);
      
      if (testResponse.status === 401) {
        return {
          success: false,
          error: 'Invalid API credentials. Please check your Turno API Token and Secret in the Supabase dashboard.'
        };
      } else if (testResponse.status === 403) {
        return {
          success: false,
          error: 'API credentials lack required permissions. Please ensure your Turno API credentials have read access to properties and problems.'
        };
      } else if (testResponse.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a few minutes.'
        };
      } else {
        return {
          success: false,
          error: `Turno API error: ${testResponse.status} ${testResponse.statusText}`
        };
      }
    }

    const responseData = await testResponse.json();
    console.log('✅ Turno API connection test successful');
    
    return { 
      success: true, 
      data: responseData,
      message: 'Successfully connected to Turno API'
    };
  } catch (error) {
    console.error('❌ Turno API connection test failed:', error);
    return {
      success: false,
      error: `Connection failed: ${error.message}`
    };
  }
};

const fetchTurnoProperties = async (token: string, secret: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🏠 Fetching properties from Turno API...');
    
    const authString = btoa(`${token}:${secret}`);
    
    const response = await fetch('https://api.turnoverbnb.com/v1/properties', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Properties API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Properties API error: ${response.status} ${response.statusText}`);
    }

    const propertiesData = await response.json();
    console.log(`✅ Found ${propertiesData.data?.length || 0} properties in Turno`);
    
    return {
      success: true,
      data: propertiesData,
      message: `Successfully fetched ${propertiesData.data?.length || 0} properties`
    };
  } catch (error) {
    console.error('❌ Error fetching Turno properties:', error);
    return {
      success: false,
      error: `Failed to fetch properties: ${error.message}`
    };
  }
};

const fetchTurnoProblems = async (token: string, secret: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🔧 Fetching problems from Turno API...');
    
    const authString = btoa(`${token}:${secret}`);
    
    const response = await fetch('https://api.turnoverbnb.com/v1/problems', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Problems API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Problems API error: ${response.status} ${response.statusText}`);
    }

    const problemsData = await response.json();
    console.log(`✅ Found ${problemsData.data?.length || 0} problems in Turno`);
    
    return {
      success: true,
      data: problemsData,
      message: `Successfully fetched ${problemsData.data?.length || 0} problems`
    };
  } catch (error) {
    console.error('❌ Error fetching Turno problems:', error);
    return {
      success: false,
      error: `Failed to fetch problems: ${error.message}`
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const turnoApiToken = Deno.env.get('TURNO_API_TOKEN');
    const turnoApiSecret = Deno.env.get('TURNO_API_SECRET');
    
    console.log('🏨 Starting Turno API connectivity test...');
    console.log(`🔑 API token present: ${!!turnoApiToken}`);
    console.log(`🔑 API secret present: ${!!turnoApiSecret}`);

    if (!turnoApiToken || !turnoApiSecret) {
      console.error('❌ Turno API credentials not found in environment');
      throw new Error('Turno API credentials not configured. Please add TURNO_API_TOKEN and TURNO_API_SECRET in the Supabase dashboard under Settings > Edge Functions.');
    }

    if (!validateApiCredentials(turnoApiToken, turnoApiSecret)) {
      console.error('❌ Invalid Turno API credentials format');
      throw new Error('Invalid Turno API credentials format. Please check your API token and secret.');
    }

    // Test API connection
    const connectionTest = await testTurnoApiConnection(turnoApiToken, turnoApiSecret);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error);
    }

    // Fetch properties to test data access
    const propertiesResult = await fetchTurnoProperties(turnoApiToken, turnoApiSecret);
    
    // Fetch problems to test problem reporting access
    const problemsResult = await fetchTurnoProblems(turnoApiToken, turnoApiSecret);

    const result = {
      success: true,
      message: 'Turno API integration test completed successfully',
      data: {
        connection: connectionTest.data,
        properties: propertiesResult.success ? {
          count: propertiesResult.data?.data?.length || 0,
          sample: propertiesResult.data?.data?.slice(0, 2) || []
        } : { error: propertiesResult.error },
        problems: problemsResult.success ? {
          count: problemsResult.data?.data?.length || 0,
          sample: problemsResult.data?.data?.slice(0, 2) || []
        } : { error: problemsResult.error }
      },
      stats: {
        totalProperties: propertiesResult.data?.data?.length || 0,
        totalProblems: problemsResult.data?.data?.length || 0,
        connectionStatus: 'connected'
      }
    };

    console.log('🎉 Turno API test completed:', result.stats);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Turno sync error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to connect to Turno API',
        troubleshooting: {
          commonIssues: [
            'Invalid or expired API credentials',
            'API credentials lack required permissions',
            'Rate limiting from Turno API',
            'Network connectivity issues'
          ],
          nextSteps: [
            'Verify your Turno API credentials in Supabase dashboard',
            'Check API key permissions in Turno dashboard',
            'Try again in a few minutes if rate limited'
          ]
        }
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);