
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendNewsletterSMSRequest {
  message: string;
  subscriberIds?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openPhoneApiKey = Deno.env.get('OPENPHONE_API_KEY');
    
    if (!openPhoneApiKey) {
      throw new Error('OPENPHONE_API_KEY not configured');
    }

    const { message, subscriberIds }: SendNewsletterSMSRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message content is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('📱 Starting newsletter SMS send...');

    // Get SMS subscribers
    let query = supabaseClient
      .from('newsletter_subscribers')
      .select('id, phone, name')
      .eq('is_active', true)
      .eq('sms_opt_in', true)
      .not('phone', 'is', null);

    if (subscriberIds && subscriberIds.length > 0) {
      query = query.in('id', subscriberIds);
    }

    const { data: subscribers, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No SMS subscribers found',
          sentCount: 0 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`📱 Found ${subscribers.length} SMS subscribers`);

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send SMS to each subscriber
    for (const subscriber of subscribers) {
      try {
        const personalizedMessage = subscriber.name 
          ? `Hi ${subscriber.name}, ${message}`
          : message;

        const smsResponse = await fetch('https://api.openphone.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': openPhoneApiKey, // QUO API does NOT use Bearer prefix
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: [subscriber.phone],
            content: personalizedMessage, // QUO API uses 'content' not 'text'
          }),
        });

        if (smsResponse.ok) {
          sentCount++;
          console.log(`✅ SMS sent to ${subscriber.phone}`);
        } else {
          failedCount++;
          const errorText = await smsResponse.text();
          console.error(`❌ Failed to send SMS to ${subscriber.phone}:`, errorText);
          errors.push(`Failed to send to ${subscriber.phone}: ${smsResponse.statusText}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        failedCount++;
        console.error(`❌ Error sending SMS to ${subscriber.phone}:`, error);
        errors.push(`Error sending to ${subscriber.phone}: ${error.message}`);
      }
    }

    const result = {
      success: true,
      message: `SMS newsletter sent successfully`,
      sentCount,
      failedCount,
      totalSubscribers: subscribers.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('📱 Newsletter SMS send completed:', result);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ Newsletter SMS error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send newsletter SMS'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
