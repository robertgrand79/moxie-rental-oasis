
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserRequest {
  userId: string;
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Delete user function called');

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

    const { userId, organizationId }: DeleteUserRequest = await req.json();

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

    // Verify target user belongs to the same organization
    const { data: targetMembership, error: targetError } = await supabaseClient
      .from('organization_members')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (targetError || !targetMembership) {
      return new Response(
        JSON.stringify({ error: 'User not found in this organization' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user details for logging
    const { data: targetUser, error: userError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete from auth.users (this will cascade to profiles due to foreign key)
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the action
    await supabaseClient
      .from('user_audit_logs')
      .insert({
        action: 'user_deleted',
        target_user_id: userId,
        target_user_email: targetUser.email,
        performed_by: user.id,
        details: { full_name: targetUser.full_name, organization_id: organizationId }
      });

    console.log('User deleted successfully:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
