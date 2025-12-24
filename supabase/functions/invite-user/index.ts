
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
  team_role?: 'owner' | 'manager' | 'staff' | 'view_only';
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

    const { email, full_name, role, team_role, organizationId }: InviteUserRequest = await req.json();
    const effectiveTeamRole = team_role || 'staff';

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'Organization ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is platform admin OR organization owner/manager
    const { data: platformAdmin } = await supabaseClient
      .from('platform_admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const isPlatformAdmin = !!platformAdmin;

    // If not platform admin, check organization membership and team permissions
    if (!isPlatformAdmin) {
      const { data: orgMembership, error: membershipError } = await supabaseClient
        .from('organization_members')
        .select('role, team_role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();

      if (membershipError || !orgMembership) {
        console.error('Organization membership check failed:', membershipError);
        return new Response(
          JSON.stringify({ error: 'Organization membership required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Only owner can manage team
      const hasTeamPermission = orgMembership.team_role === 'owner' || 
                                ['owner', 'admin'].includes(orgMembership.role);
      
      if (!hasTeamPermission) {
        console.error('Team management permission denied');
        return new Response(
          JSON.stringify({ error: 'Only owners can invite team members' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get organization details
    const { data: organization } = await supabaseClient
      .from('organizations')
      .select('name, slug')
      .eq('id', organizationId)
      .single();

    // Get inviter's profile
    const { data: inviterProfile } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const inviterName = inviterProfile?.full_name || 'Admin';
    const organizationName = organization?.name || 'the organization';

    // Check if user already exists in profiles
    const { data: existingUser } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (existingUser) {
      // User exists - check if they're already in this organization
      const { data: existingMembership } = await supabaseClient
        .from('organization_members')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('organization_id', organizationId)
        .single();

      if (existingMembership) {
        return new Response(
          JSON.stringify({ error: 'User is already a member of this organization' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Add existing user directly to organization with team_role
      const { error: addMemberError } = await supabaseClient
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: existingUser.id,
          role: role,
          team_role: effectiveTeamRole,
          invited_by: user.id,
        });

      if (addMemberError) {
        console.error('Error adding member to organization:', addMemberError);
        return new Response(
          JSON.stringify({ error: 'Failed to add user to organization' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log the action
      await supabaseClient
        .from('user_audit_logs')
        .insert({
          action: 'user_added_to_organization',
          target_user_email: email,
          performed_by: user.id,
          details: { role, team_role: effectiveTeamRole, full_name, organization_id: organizationId, existing_user: true }
        });

      // Log team activity
      await supabaseClient
        .from('team_activity_log')
        .insert({
          organization_id: organizationId,
          user_id: user.id,
          action_type: 'team_member_added',
          entity_type: 'organization_member',
          entity_id: existingUser.id,
          details: { email, role, team_role: effectiveTeamRole, added_by: inviterName }
        });

      console.log('Existing user added to organization:', existingUser.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${email} has been added to the organization`,
          added_directly: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User doesn't exist - create invitation for new user
    // Check if invitation already exists for this org
    const { data: existingInvitation } = await supabaseClient
      .from('user_invitations')
      .select('id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: 'Active invitation already exists for this email in this organization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();

    // Create invitation record with organization context and team_role
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('user_invitations')
      .insert({
        email,
        full_name,
        role,
        team_role: effectiveTeamRole,
        invited_by: user.id,
        invitation_token: invitationToken,
        organization_id: organizationId,
        status: 'pending',
        inviter_name: inviterName,
        organization_name: organizationName,
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
        details: { role, team_role: effectiveTeamRole, full_name, organization_id: organizationId }
      });

    // Log team activity
    await supabaseClient
      .from('team_activity_log')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        action_type: 'invitation_sent',
        entity_type: 'user_invitation',
        entity_id: invitation.id,
        details: { email, role, team_role: effectiveTeamRole, inviter_name: inviterName }
      });

    console.log('Invitation created successfully:', invitation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}`,
        invitation_id: invitation.id,
        invitation_token: invitationToken
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
