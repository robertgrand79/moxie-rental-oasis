
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteUserRequest {
  email: string;
  full_name?: string;
  role: string;
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Invite user function called');

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

    const { email, full_name, role, organizationId }: InviteUserRequest = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'Organization ID is required' }),
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

    // If not platform admin, check organization membership
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

    // Generate invitation token
    const invitationToken = crypto.randomUUID();

    // Check if user already exists
    const { data: existingUser } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation already exists for this org
    const { data: existingInvitation } = await supabaseClient
      .from('user_invitations')
      .select('id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: 'Active invitation already exists for this email in this organization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create invitation record with organization context
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('user_invitations')
      .insert({
        email,
        full_name,
        role,
        invited_by: user.id,
        invitation_token: invitationToken,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the action
    await supabaseClient
      .from('user_audit_logs')
      .insert({
        action: 'user_invited',
        target_user_email: email,
        performed_by: user.id,
        details: { role, full_name, organization_id: organizationId }
      });

    console.log('Invitation created successfully:', invitation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}`,
        invitation_id: invitation.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in invite-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
