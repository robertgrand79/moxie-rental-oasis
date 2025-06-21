
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { getSuccessPage, getErrorPage } from './responseTemplates.ts';
import { getAcknowledgementToken, updateWorkOrderStatus, markTokenAsUsed, validateToken } from './databaseService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request received');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== ACKNOWLEDGE WORK ORDER FUNCTION START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Environment check - SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'Present' : 'Missing');
  console.log('Environment check - SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Present' : 'Missing');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    console.log('Token parameter:', token ? 'Present' : 'Missing');
    console.log('Token length:', token ? token.length : 0);

    if (!token) {
      console.log('ERROR: No token provided in URL');
      return new Response(getErrorPage('Invalid acknowledgement link - no token provided'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
        status: 400,
      });
    }

    // Get the acknowledgement token and work order details
    let tokenData;
    try {
      tokenData = await getAcknowledgementToken(supabase, token);
    } catch (error) {
      return new Response(getErrorPage(error.message), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
        status: 404,
      });
    }

    // Validate token
    const { isExpired, isUsed } = validateToken(tokenData);

    if (isExpired) {
      return new Response(getErrorPage('This acknowledgement link has expired'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
        status: 410,
      });
    }

    if (isUsed) {
      console.log('Token already used - showing success page');
      return new Response(getSuccessPage(tokenData.work_order, true), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
      });
    }

    // Update work order status and mark token as used
    try {
      await updateWorkOrderStatus(supabase, tokenData.work_order_id);
      await markTokenAsUsed(supabase, tokenData.id);
    } catch (error) {
      return new Response(getErrorPage(error.message), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
        status: 500,
      });
    }

    console.log('=== ACKNOWLEDGEMENT COMPLETED SUCCESSFULLY ===');

    return new Response(getSuccessPage(tokenData.work_order, false), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR IN ACKNOWLEDGE FUNCTION ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    return new Response(getErrorPage('An unexpected error occurred - please contact support'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
      status: 500,
    });
  }
});
