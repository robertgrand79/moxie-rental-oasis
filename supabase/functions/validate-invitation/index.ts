import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
};

interface ValidateInvitationRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Validate invitation function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client identifier for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIP = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    const ipIdentifier = clientIP.substring(0, 45); // Limit length

    const { token }: ValidateInvitationRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit (10 attempts per 15 minutes per IP)
    const { data: isAllowed } = await supabaseClient.rpc('check_invitation_rate_limit', {
      p_ip_identifier: ipIdentifier,
      p_max_attempts: 10,
      p_window_minutes: 15
    });

    if (!isAllowed) {
      console.warn(`Rate limit exceeded for IP: ${ipIdentifier}`);
      
      // Log the rate-limited attempt
      await supabaseClient.rpc('log_invitation_attempt', {
        p_ip_identifier: ipIdentifier,
        p_token_hash: token.substring(0, 8), // Only log first 8 chars
        p_was_successful: false
      });

      return new Response(
        JSON.stringify({ error: 'Too many validation attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the invitation token
    const { data: invitation, error: fetchError } = await supabaseClient
      .from('user_invitations')
      .select('id, email, full_name, role, team_role, organization_name, inviter_name, expires_at, organization_id')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (fetchError || !invitation) {
      console.log('Invalid invitation token attempted:', token.substring(0, 8));
      
      // Log failed attempt
      await supabaseClient.rpc('log_invitation_attempt', {
        p_ip_identifier: ipIdentifier,
        p_token_hash: token.substring(0, 8),
        p_was_successful: false
      });

      return new Response(
        JSON.stringify({ error: 'This invitation is invalid or has already been used.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Log failed attempt (expired)
      await supabaseClient.rpc('log_invitation_attempt', {
        p_ip_identifier: ipIdentifier,
        p_token_hash: token.substring(0, 8),
        p_was_successful: false
      });

      return new Response(
        JSON.stringify({ error: 'This invitation has expired. Please request a new invitation.' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful validation
    await supabaseClient.rpc('log_invitation_attempt', {
      p_ip_identifier: ipIdentifier,
      p_token_hash: token.substring(0, 8),
      p_was_successful: true
    });

    console.log('Invitation validated successfully:', invitation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation: {
          id: invitation.id,
          email: invitation.email,
          full_name: invitation.full_name,
          role: invitation.role,
          team_role: invitation.team_role,
          organization_name: invitation.organization_name,
          inviter_name: invitation.inviter_name,
          expires_at: invitation.expires_at,
          organization_id: invitation.organization_id
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-invitation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
