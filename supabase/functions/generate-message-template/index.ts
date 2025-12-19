import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateTemplateRequest {
  organizationId: string;
  templateType: 'welcome' | 'checkin' | 'checkout' | 'followup' | 'custom';
  description?: string;
  existingContent?: string;
  action: 'generate' | 'improve';
  propertyId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      organizationId, 
      templateType, 
      description, 
      existingContent,
      action,
      propertyId 
    }: GenerateTemplateRequest = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: "Organization ID is required" }),
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

    // Fetch organization and property context
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const { data: siteSettings } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('organization_id', organizationId)
      .in('key', ['siteName', 'tagline', 'contactEmail', 'phone']);

    const settingsMap: Record<string, string> = {};
    siteSettings?.forEach((s: { key: string; value: any }) => {
      settingsMap[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
    });

    let propertyContext = "";
    if (propertyId) {
      const { data: property } = await supabase
        .from('properties')
        .select('title, location, city, bedrooms, bathrooms, max_guests, amenities')
        .eq('id', propertyId)
        .single();
      
      if (property) {
        propertyContext = `
Property Details:
- Name: ${property.title}
- Location: ${property.location || property.city || 'Not specified'}
- Size: ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms
- Capacity: Up to ${property.max_guests} guests
- Amenities: ${Array.isArray(property.amenities) ? property.amenities.join(', ') : 'Various amenities'}
`;
      }
    }

    const companyName = settingsMap.siteName || org?.name || 'Our Vacation Rental';

    const templateTypeDescriptions: Record<string, string> = {
      welcome: "A warm welcome message sent immediately after a booking is confirmed. Should make the guest feel excited about their stay.",
      checkin: "Check-in instructions sent before arrival. Should include essential arrival info and house access details.",
      checkout: "Check-out reminder and instructions. Should be friendly and include any checkout procedures.",
      followup: "A follow-up message after checkout asking about their experience and encouraging reviews.",
      custom: description || "A custom message template for guest communication."
    };

    const availableVariables = `
Available template variables (use these in double curly braces):
{{guest_name}} - Guest's name
{{property_name}} - Property name
{{property_address}} - Property address
{{check_in_date}} - Check-in date
{{check_out_date}} - Check-out date
{{check_in_time}} - Check-in time (usually 4:00 PM)
{{check_out_time}} - Check-out time (usually 11:00 AM)
{{wifi_network}} - WiFi network name
{{wifi_password}} - WiFi password
{{door_code}} - Door access code
{{nights_count}} - Number of nights
{{guest_count}} - Number of guests
{{guidebook_link}} - Link to digital guidebook
`;

    let systemPrompt = `You are an expert vacation rental communication specialist for ${companyName}. You create warm, professional, and effective guest communication templates.

${propertyContext}

${availableVariables}

Guidelines:
- Be warm and welcoming but professional
- Keep messages concise and scannable
- Include relevant template variables where appropriate
- Focus on essential information for the message type
- Use a friendly, hospitality-focused tone
- Include a clear call-to-action when relevant`;

    let userPrompt: string;
    
    if (action === 'improve' && existingContent) {
      userPrompt = `Please improve this existing message template while maintaining its core intent. Make it more engaging, clear, and professional:

Current content:
${existingContent}

${description ? `Additional instructions: ${description}` : ''}

Provide:
1. An improved subject line (if applicable)
2. The improved message content with template variables preserved`;
    } else {
      userPrompt = `Generate a ${templateType} message template for guest communications.

Template type description: ${templateTypeDescriptions[templateType]}
${description ? `Additional context: ${description}` : ''}

Provide:
1. A compelling subject line for emails
2. The message content using appropriate template variables

Format your response as:
SUBJECT: [subject line here]
---
[message content here]`;
    }

    console.log("Generating template with AI...");

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

    // Parse the response to extract subject and content
    let subject = '';
    let content = generatedContent;

    if (generatedContent.includes('SUBJECT:') && generatedContent.includes('---')) {
      const parts = generatedContent.split('---');
      const subjectMatch = parts[0].match(/SUBJECT:\s*(.+)/i);
      if (subjectMatch) {
        subject = subjectMatch[1].trim();
      }
      content = parts.slice(1).join('---').trim();
    } else if (generatedContent.includes('Subject:')) {
      const lines = generatedContent.split('\n');
      const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'));
      if (subjectLine) {
        subject = subjectLine.replace(/^subject:\s*/i, '').trim();
        content = lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim();
      }
    }

    console.log("Template generated successfully");

    return new Response(
      JSON.stringify({ 
        subject: subject || `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} from ${companyName}`,
        content,
        raw: generatedContent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating template:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
