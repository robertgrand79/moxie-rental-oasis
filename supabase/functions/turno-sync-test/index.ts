import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Simple turno-sync test function running...');
    
    // Get credentials from environment
    const turnoApiToken = Deno.env.get('TURNO_API_TOKEN');
    const turnoApiSecret = Deno.env.get('TURNO_API_SECRET');
    const turnoPartnerId = Deno.env.get('TURNO_PARTNER_ID');
    
    console.log('🔧 Credentials check:', {
      hasToken: !!turnoApiToken,
      hasSecret: !!turnoApiSecret,
      hasPartnerId: !!turnoPartnerId
    });

    if (!turnoApiToken || !turnoApiSecret) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing Turno API credentials. Please configure TURNO_API_TOKEN and TURNO_API_SECRET in Supabase secrets.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Simple API test
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${turnoApiSecret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (turnoPartnerId) {
      headers['TBNB-Partner-ID'] = turnoPartnerId;
    }

    const response = await fetch('https://api.turnoverbnb.com/v2/properties', {
      method: 'GET',
      headers,
    });

    const isSuccess = response.ok;
    const message = isSuccess 
      ? 'Turno API connection test successful' 
      : `API test failed: ${response.status} ${response.statusText}`;

    return new Response(JSON.stringify({
      success: isSuccess,
      message,
      status: response.status,
      timestamp: new Date().toISOString()
    }), {
      status: isSuccess ? 200 : 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('❌ Test function error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Test function failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);