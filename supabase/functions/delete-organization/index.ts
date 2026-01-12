import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for auth operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the authorization header to verify the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the requesting user is a platform admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is platform admin
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('platform_admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (adminError || !adminCheck) {
      console.error('Admin check failed:', adminError);
      return new Response(
        JSON.stringify({ error: 'Platform admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { organizationId } = await req.json();
    
    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'organizationId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Deleting organization: ${organizationId} by admin: ${user.id}`);

    // Get organization details for logging
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name, is_template')
      .eq('id', organizationId)
      .maybeSingle();

    if (orgError || !org) {
      console.error('Organization not found:', orgError);
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent deletion of template organizations
    if (org.is_template) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete template organizations. Unmark as template first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all members of this organization
    const { data: members, error: membersError } = await supabaseAdmin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organizationId);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch organization members' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userIds = members?.map(m => m.user_id) || [];
    console.log(`Found ${userIds.length} members to process`);

    let deletedUsers = 0;
    let skippedUsers = 0;
    const errors: string[] = [];

    // Process each user
    for (const userId of userIds) {
      // Check if user belongs to multiple organizations
      const { data: otherMemberships, error: membershipError } = await supabaseAdmin
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .neq('organization_id', organizationId);

      if (membershipError) {
        console.error(`Error checking memberships for user ${userId}:`, membershipError);
        errors.push(`Failed to check memberships for user ${userId}`);
        continue;
      }

      if (otherMemberships && otherMemberships.length > 0) {
        // User belongs to other organizations, just remove their membership
        console.log(`User ${userId} belongs to ${otherMemberships.length} other org(s), skipping deletion`);
        skippedUsers++;
        continue;
      }

      // Delete user from auth (this cascades to profiles and organization_members)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error(`Error deleting user ${userId}:`, deleteError);
        errors.push(`Failed to delete user ${userId}: ${deleteError.message}`);
      } else {
        console.log(`Deleted user: ${userId}`);
        deletedUsers++;
      }
    }

    // Delete all dependent data before deleting the organization
    // Order matters: delete child tables first to avoid FK violations
    console.log('Cleaning up dependent data...');
    
    // Core organization data
    await supabaseAdmin.from('organization_members').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('organization_onboarding').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('site_settings').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('message_templates').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('assistant_settings').delete().eq('organization_id', organizationId);
    
    // Communication and notifications
    await supabaseAdmin.from('admin_notifications').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('newsletter_subscribers').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('newsletter_campaigns').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('community_updates').delete().eq('organization_id', organizationId);
    
    // Properties and related data (get property IDs first)
    const { data: properties } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('organization_id', organizationId);
    
    const propertyIds = properties?.map(p => p.id) || [];
    
    if (propertyIds.length > 0) {
      // Delete property-dependent data
      await supabaseAdmin.from('property_reservations').delete().in('property_id', propertyIds);
      await supabaseAdmin.from('reservations').delete().in('property_id', propertyIds);
      await supabaseAdmin.from('availability_blocks').delete().in('property_id', propertyIds);
      await supabaseAdmin.from('dynamic_pricing').delete().in('property_id', propertyIds);
      await supabaseAdmin.from('external_calendars').delete().in('property_id', propertyIds);
      await supabaseAdmin.from('points_of_interest').delete().in('property_id', propertyIds);
      await supabaseAdmin.from('seam_devices').delete().in('property_id', propertyIds);
      await supabaseAdmin.from('device_configurations').delete().in('property_id', propertyIds);
    }
    
    // Delete properties
    await supabaseAdmin.from('properties').delete().eq('organization_id', organizationId);
    
    // Content data
    await supabaseAdmin.from('blog_posts').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('testimonials').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('lifestyle_gallery').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('eugene_events').delete().eq('organization_id', organizationId);
    
    // Work orders and maintenance
    await supabaseAdmin.from('work_orders').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('contractors').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('turnover_checklist_templates').delete().eq('organization_id', organizationId);
    
    // Chat and conversations
    await supabaseAdmin.from('assistant_conversations').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('chat_sessions').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('guest_inbox_threads').delete().eq('organization_id', organizationId);
    
    // Other org data
    await supabaseAdmin.from('promotional_codes').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('tax_rates').delete().eq('organization_id', organizationId);
    await supabaseAdmin.from('user_invitations').delete().eq('organization_id', organizationId);
    
    console.log('Dependent data cleaned up, deleting organization...');

    const { error: deleteOrgError } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', organizationId);

    if (deleteOrgError) {
      console.error('Error deleting organization:', deleteOrgError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete organization',
          details: deleteOrgError.message,
          deletedUsers,
          skippedUsers
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the deletion for audit
    await supabaseAdmin
      .from('admin_audit_logs')
      .insert({
        action: 'DELETE_ORGANIZATION',
        table_name: 'organizations',
        record_id: organizationId,
        admin_id: user.id,
        old_values: {
          organization_name: org.name,
          deleted_users: deletedUsers,
          skipped_users: skippedUsers
        }
      });

    console.log(`Organization ${org.name} deleted successfully. Users deleted: ${deletedUsers}, skipped: ${skippedUsers}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Organization "${org.name}" deleted successfully`,
        deletedUsers,
        skippedUsers,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
