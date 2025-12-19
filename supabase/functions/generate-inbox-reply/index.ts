import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateReplyRequest {
  threadId: string;
  organizationId: string;
  guestMessage?: string;
  replyType?: 'quick' | 'detailed';
  targetLanguage?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      threadId, 
      organizationId,
      guestMessage,
      replyType = 'quick',
      targetLanguage
    }: GenerateReplyRequest = await req.json();

    if (!threadId || !organizationId) {
      return new Response(
        JSON.stringify({ error: "Thread ID and Organization ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch thread details
    const { data: thread, error: threadError } = await supabase
      .from('guest_inbox_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return new Response(
        JSON.stringify({ error: "Thread not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch recent messages from thread
    const { data: messages } = await supabase
      .from('guest_communications')
      .select('direction, message_content, message_type, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch reservations for context
    let reservationContext = "";
    if (thread.guest_email) {
      const { data: reservations } = await supabase
        .from('property_reservations')
        .select(`
          check_in_date,
          check_out_date,
          guest_count,
          booking_status,
          property_id,
          properties(title, location)
        `)
        .eq('guest_email', thread.guest_email)
        .order('check_in_date', { ascending: false })
        .limit(3);

      if (reservations && reservations.length > 0) {
        reservationContext = "Guest's reservations:\n" + reservations.map(r => {
          const property = r.properties as any;
          return `- ${property?.title || 'Property'}: ${r.check_in_date} to ${r.check_out_date} (${r.booking_status})`;
        }).join('\n');
      }
    }

    // Fetch organization context
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const { data: siteSettings } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('organization_id', organizationId)
      .in('key', ['siteName', 'phone', 'contactEmail']);

    const settingsMap: Record<string, string> = {};
    siteSettings?.forEach((s: { key: string; value: any }) => {
      settingsMap[s.key] = typeof s.value === 'string' ? s.value : '';
    });

    const companyName = settingsMap.siteName || org?.name || 'Our Property Management';
    const companyPhone = settingsMap.phone || '';
    const companyEmail = settingsMap.contactEmail || '';

    // Build conversation history
    const conversationHistory = (messages || []).reverse().map(m => {
      const sender = m.direction === 'inbound' ? 'Guest' : 'Host';
      return `${sender}: ${m.message_content}`;
    }).join('\n\n');

    // Determine the latest guest message
    const latestGuestMessage = guestMessage || 
      messages?.find(m => m.direction === 'inbound')?.message_content || 
      '';

    // Detect language from guest message if not specified
    const languageInstruction = targetLanguage && targetLanguage !== 'en' 
      ? `Respond in ${targetLanguage}. The guest wrote in this language.`
      : thread.detected_language && thread.detected_language !== 'en'
        ? `The guest's detected language is ${thread.detected_language}. Respond in the same language if appropriate.`
        : '';

    const systemPrompt = `You are a professional and friendly guest communication assistant for ${companyName}.

${reservationContext}

Company contact info:
${companyPhone ? `- Phone: ${companyPhone}` : ''}
${companyEmail ? `- Email: ${companyEmail}` : ''}

Your role:
- Generate helpful, warm, and professional reply suggestions
- Address the guest's specific questions or concerns
- Be concise but thorough
- Maintain a hospitable tone
- Include relevant details from the reservation if applicable

${languageInstruction}

Generate ${replyType === 'detailed' ? '2-3' : '2'} different reply options with varying tones:
1. A warm and friendly response
2. A more concise/professional response
${replyType === 'detailed' ? '3. A comprehensive response with more details' : ''}

Format each reply with:
REPLY 1:
[reply content]

REPLY 2:
[reply content]
${replyType === 'detailed' ? '\nREPLY 3:\n[reply content]' : ''}`;

    const userPrompt = `Here's the conversation history:

${conversationHistory || 'No previous messages'}

Latest message from guest:
${latestGuestMessage || 'No specific message - generate general follow-up options'}

Generate ${replyType === 'detailed' ? '3' : '2'} reply suggestions.`;

    console.log("Generating reply suggestions...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1500,
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || '';

    // Parse replies from the response
    const replies: string[] = [];
    const replyMatches = generatedContent.split(/REPLY\s*\d+:/i);
    
    for (let i = 1; i < replyMatches.length; i++) {
      const reply = replyMatches[i].trim();
      if (reply) {
        replies.push(reply);
      }
    }

    // Fallback if parsing failed
    if (replies.length === 0) {
      replies.push(generatedContent);
    }

    console.log(`Generated ${replies.length} reply suggestions`);

    return new Response(
      JSON.stringify({ 
        suggestions: replies,
        detectedLanguage: thread.detected_language,
        raw: generatedContent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating reply:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
