import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@6.9.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationEmailRequest {
  email: string;
  full_name?: string;
  role: string;
  invitedBy: string;
  invitationToken: string;
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Send invitation email function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
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

    const { email, full_name, role, invitedBy, invitationToken, organizationId }: InvitationEmailRequest = await req.json();

    console.log('Sending invitation email for organization:', organizationId);

    // Get organization details for domain
    const { data: org } = await supabaseClient
      .from('organizations')
      .select('slug, custom_domain')
      .eq('id', organizationId)
      .single();

    console.log('Organization details:', org);

    // Get site settings for branding - filter by organization
    const { data: settings } = await supabaseClient
      .from('site_settings')
      .select('key, value')
      .eq('organization_id', organizationId)
      .in('key', ['siteName', 'emailFromAddress', 'emailFromName']);

    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>) || {};

    const siteName = settingsMap.siteName || 'Vacation Rentals';
    const fromEmail = settingsMap.emailFromAddress || '';
    const fromName = settingsMap.emailFromName || siteName;

    // Get inviter's name
    const { data: inviterProfile } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', invitedBy)
      .single();

    const inviterName = inviterProfile?.full_name || 'Admin';

    // Create invitation URL using organization's custom domain or fallback
    let baseUrl: string;
    if (org?.custom_domain) {
      baseUrl = `https://${org.custom_domain}`;
    } else {
      // Fallback to APP_BASE_URL or construct from Lovable app URL
      baseUrl = Deno.env.get('APP_BASE_URL') || 'https://moxie-system-99.lovable.app';
    }
    
    const invitationUrl = `${baseUrl}/auth?invitation=${invitationToken}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 32px; font-weight: bold;">${siteName}</h1>
          <p style="color: #6b7280; margin-top: 8px;">Your Direct Booking Partner</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a202c; margin-top: 0;">You're Invited!</h2>
          
          <p style="color: #4a5568; line-height: 1.6;">
            Hello${full_name ? ` ${full_name}` : ''},
          </p>
          
          <p style="color: #4a5568; line-height: 1.6;">
            ${inviterName} has invited you to join ${siteName} as a <strong>${role}</strong>.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background: linear-gradient(to right, #3b82f6, #2563eb); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #718096; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, you can copy and paste this link into your browser:
            <br>
            <a href="${invitationUrl}" style="color: #2563eb; word-break: break-all;">${invitationUrl}</a>
          </p>
          
          <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            This invitation will expire in 7 days. If you have any questions, please contact your administrator.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
          <p style="margin-top: 8px;">Built by vacation rental operators, for vacation rental operators.</p>
        </div>
      </div>
    `;

    const emailResult = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `You're invited to join ${siteName}`,
      html: emailHtml,
    });

    if (emailResult.error) {
      throw new Error(emailResult.error.message);
    }

    console.log('Invitation email sent successfully:', emailResult.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.data?.id,
        message: `Invitation email sent to ${email}` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending invitation email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send invitation email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);