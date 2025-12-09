import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PropertyContext {
  title: string;
  description: string;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee: number;
  amenities: string;
  checkInInstructions?: string;
  wifiName?: string;
}

/**
 * Aggregates property context for the AI assistant
 */
async function aggregatePropertyContext(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<PropertyContext[]> {
  console.log("Fetching properties for organization:", organizationId);

  // Fetch all properties for this organization
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      description,
      location,
      city,
      bedrooms,
      bathrooms,
      max_guests,
      price_per_night,
      cleaning_fee,
      amenities
    `)
    .eq('organization_id', organizationId);

  if (propertiesError) {
    console.error("Error fetching properties:", propertiesError);
    return [];
  }

  if (!properties || properties.length === 0) {
    console.log("No properties found for organization");
    return [];
  }

  console.log(`Found ${properties.length} properties`);

  // Fetch access details for all properties
  const propertyIds = properties.map(p => p.id);
  const { data: accessDetails, error: accessError } = await supabase
    .from('property_access_details')
    .select('property_id, check_in_instructions, wifi_name')
    .in('property_id', propertyIds);

  if (accessError) {
    console.error("Error fetching access details:", accessError);
  }

  // Map access details by property ID
  const accessMap = new Map(
    (accessDetails || []).map(ad => [ad.property_id, ad])
  );

  // Combine property data with access details
  return properties.map(property => {
    const access = accessMap.get(property.id);
    return {
      title: property.title || '',
      description: property.description || '',
      location: property.location || '',
      city: property.city || '',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      maxGuests: property.max_guests || 0,
      pricePerNight: property.price_per_night || 0,
      cleaningFee: property.cleaning_fee || 0,
      amenities: property.amenities || '',
      checkInInstructions: access?.check_in_instructions || undefined,
      wifiName: access?.wifi_name || undefined,
    };
  });
}

/**
 * Builds the system prompt with property context
 */
function buildSystemPrompt(properties: PropertyContext[], siteName?: string): string {
  const businessName = siteName || 'our vacation rental company';

  if (properties.length === 0) {
    return `You are a helpful AI assistant for ${businessName}. You help visitors with vacation rental inquiries.
    
Be friendly, concise, and helpful. If you don't have specific property information available, encourage visitors to contact the host directly or browse the website for details.

Standard policies:
- Check-in time: 4:00 PM
- Check-out time: 11:00 AM
- Pets: Contact host for pet policy
- Cancellation: Contact host for cancellation policy`;
  }

  // Build property context sections
  const propertyContexts = properties.map(property => {
    const amenitiesList = property.amenities
      ? property.amenities.split(',').slice(0, 15).map(a => a.trim()).join(', ')
      : 'Contact host for amenities list';

    return `
## ${property.title}
- **Location**: ${property.location}${property.city ? `, ${property.city}` : ''}
- **Bedrooms**: ${property.bedrooms} | **Bathrooms**: ${property.bathrooms} | **Max Guests**: ${property.maxGuests}
- **Price**: $${property.pricePerNight}/night${property.cleaningFee > 0 ? ` + $${property.cleaningFee} cleaning fee` : ''}
- **Key Amenities**: ${amenitiesList}
${property.description ? `\n**Description**: ${property.description.substring(0, 500)}${property.description.length > 500 ? '...' : ''}` : ''}`;
  }).join('\n\n');

  return `You are a helpful AI assistant for ${businessName}, a vacation rental company. You have detailed knowledge of our properties and can help visitors with their questions.

# PROPERTY INFORMATION
${propertyContexts}

# STANDARD POLICIES
- **Check-in Time**: 4:00 PM
- **Check-out Time**: 11:00 AM  
- **Same-day turnover**: Yes, guests can check in on the same day another guest checks out
- **Cancellation**: Flexible - contact host for specific policy details
- **Pets**: Contact host to confirm pet policy for each property
- **Booking**: Guests can book directly through the website

# YOUR ROLE
- Answer questions about properties, amenities, locations, and pricing
- Help with availability inquiries (encourage them to check the calendar on the property page)
- Provide local area recommendations when asked
- Guide visitors through the booking process
- Be warm, helpful, and professional

# GUIDELINES
- Keep responses concise but informative (2-4 sentences for simple questions)
- If asked about something not covered above, politely suggest contacting the host directly
- Never invent or assume information not provided
- Encourage direct booking through the website
- If comparing properties, highlight key differences to help guests choose`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], organizationId } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client for fetching property context
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    let propertyContext: PropertyContext[] = [];
    let siteName: string | undefined;

    if (supabaseUrl && supabaseServiceKey && organizationId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Fetch property context
      propertyContext = await aggregatePropertyContext(supabase, organizationId);
      
      // Fetch organization/site name
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      
      if (orgData) {
        siteName = orgData.name;
      }

      console.log(`Loaded context for ${propertyContext.length} properties, site: ${siteName}`);
    } else {
      console.log("Missing Supabase credentials or organizationId, using generic context");
    }

    // Build system prompt with property context
    const systemPrompt = buildSystemPrompt(propertyContext, siteName);

    // Build conversation messages
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log("Sending request to AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    console.log("Successfully generated AI response");

    return new Response(
      JSON.stringify({ aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Public AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
