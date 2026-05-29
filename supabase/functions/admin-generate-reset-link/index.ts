import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateLinkRequest {
  email: string;
  organizationId: string;
  redirectTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Admin generate reset link function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, organizationId, redirectTo }: GenerateLinkRequest = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'Organization ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is platform admin OR organization admin/owner
    const { data: platformAdmin } = await supabaseClient
      .from('platform_admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const isPlatformAdmin = !!platformAdmin;

    if (!isPlatformAdmin) {
      const { data: orgMembership, error: membershipError } = await supabaseClient
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();

      if (membershipError || !orgMembership || !['owner', 'admin'].includes(orgMembership.role)) {
        console.error('Organization admin verification failed:', membershipError);
        return new Response(
          JSON.stringify({ error: 'Organization admin privileges required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate link using service role client
    const defaultRedirect = `${req.headers.get('origin') || ''}/reset-password`;
    const finalRedirect = redirectTo || defaultRedirect;

    const { data, error: generateError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: finalRedirect
      }
    });

    if (generateError) {
      console.error('Error generating link:', generateError);
      return new Response(
        JSON.stringify({ error: generateError.message || 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the action to user_audit_logs
    try {
      await supabaseClient
        .from('user_audit_logs')
        .insert({
          action: 'user_password_link_generated',
          target_user_email: email,
          performed_by: user.id,
          details: { email, organization_id: organizationId }
        });
    } catch (logError) {
      console.error('Failed to log action to user_audit_logs:', logError);
    }

    console.log('Reset link generated successfully for email:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        link: data.properties.action_link 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-generate-reset-link function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
