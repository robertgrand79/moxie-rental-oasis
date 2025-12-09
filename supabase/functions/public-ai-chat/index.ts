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
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFeePercentage: number;
  amenities: string;
  checkInInstructions?: string;
  wifiName?: string;
}

interface AvailabilityResult {
  propertyId: string;
  propertyTitle: string;
  isAvailable: boolean;
  conflicts: { startDate: string; endDate: string; blockType: string }[];
}

interface PricingResult {
  propertyId: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  dailyPrices: { date: string; price: number }[];
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  bookingUrl: string;
}

// Tool definitions for the AI
const tools = [
  {
    type: "function",
    function: {
      name: "check_availability",
      description: "Check if a property is available for specific dates. Use this when a guest asks about availability for certain dates.",
      parameters: {
        type: "object",
        properties: {
          propertyTitle: {
            type: "string",
            description: "The name/title of the property to check"
          },
          checkInDate: {
            type: "string",
            description: "Check-in date in YYYY-MM-DD format"
          },
          checkOutDate: {
            type: "string",
            description: "Check-out date in YYYY-MM-DD format"
          }
        },
        required: ["checkInDate", "checkOutDate"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_pricing_breakdown",
      description: "Get detailed pricing breakdown for a stay including nightly rates, fees, and total. Use this when a guest asks about pricing or cost for specific dates.",
      parameters: {
        type: "object",
        properties: {
          propertyTitle: {
            type: "string",
            description: "The name/title of the property"
          },
          checkInDate: {
            type: "string",
            description: "Check-in date in YYYY-MM-DD format"
          },
          checkOutDate: {
            type: "string",
            description: "Check-out date in YYYY-MM-DD format"
          }
        },
        required: ["checkInDate", "checkOutDate"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_booking_link",
      description: "Generate a direct booking link with pre-filled dates. Use this when a guest wants to book or proceed to booking.",
      parameters: {
        type: "object",
        properties: {
          propertyTitle: {
            type: "string",
            description: "The name/title of the property"
          },
          checkInDate: {
            type: "string",
            description: "Check-in date in YYYY-MM-DD format"
          },
          checkOutDate: {
            type: "string",
            description: "Check-out date in YYYY-MM-DD format"
          }
        },
        required: ["propertyTitle", "checkInDate", "checkOutDate"]
      }
    }
  }
];

/**
 * Find property by title (fuzzy match)
 */
function findPropertyByTitle(properties: PropertyContext[], searchTitle?: string): PropertyContext | null {
  if (!searchTitle) {
    return properties.length === 1 ? properties[0] : null;
  }
  
  const lowerSearch = searchTitle.toLowerCase();
  
  // Exact match first
  const exact = properties.find(p => p.title.toLowerCase() === lowerSearch);
  if (exact) return exact;
  
  // Partial match
  const partial = properties.find(p => 
    p.title.toLowerCase().includes(lowerSearch) || 
    lowerSearch.includes(p.title.toLowerCase())
  );
  if (partial) return partial;
  
  // Word match
  const words = lowerSearch.split(/\s+/);
  const wordMatch = properties.find(p => 
    words.some(word => p.title.toLowerCase().includes(word) && word.length > 3)
  );
  
  return wordMatch || null;
}

/**
 * Check availability for a property and date range
 */
async function checkAvailability(
  supabase: ReturnType<typeof createClient>,
  properties: PropertyContext[],
  propertyTitle: string | undefined,
  checkInDate: string,
  checkOutDate: string
): Promise<AvailabilityResult[]> {
  const results: AvailabilityResult[] = [];
  
  // If property specified, check just that one; otherwise check all
  const propertiesToCheck = propertyTitle 
    ? [findPropertyByTitle(properties, propertyTitle)].filter(Boolean) as PropertyContext[]
    : properties;
  
  if (propertiesToCheck.length === 0 && propertyTitle) {
    // Property not found - return empty with message
    return [{
      propertyId: '',
      propertyTitle: propertyTitle,
      isAvailable: false,
      conflicts: [{ startDate: '', endDate: '', blockType: 'Property not found' }]
    }];
  }

  for (const property of propertiesToCheck) {
    const { data: blocks, error } = await supabase
      .from('availability_blocks')
      .select('start_date, end_date, block_type')
      .eq('property_id', property.id)
      .lte('start_date', checkOutDate)
      .gte('end_date', checkInDate);

    if (error) {
      console.error("Error checking availability:", error);
      continue;
    }

    const conflicts = (blocks || [])
      .filter(b => b.block_type === 'booked' || b.block_type === 'blocked')
      .map(b => ({
        startDate: b.start_date,
        endDate: b.end_date,
        blockType: b.block_type
      }));

    results.push({
      propertyId: property.id,
      propertyTitle: property.title,
      isAvailable: conflicts.length === 0,
      conflicts
    });
  }

  return results;
}

/**
 * Get pricing breakdown for a stay
 */
async function getPricingBreakdown(
  supabase: ReturnType<typeof createClient>,
  properties: PropertyContext[],
  propertyTitle: string | undefined,
  checkInDate: string,
  checkOutDate: string,
  siteUrl?: string
): Promise<PricingResult[]> {
  const results: PricingResult[] = [];
  
  const property = findPropertyByTitle(properties, propertyTitle);
  if (!property) {
    return [];
  }

  // Calculate number of nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  if (nights <= 0) {
    return [];
  }

  // Fetch dynamic pricing for the date range
  const { data: pricing, error } = await supabase
    .from('dynamic_pricing')
    .select('date, final_price')
    .eq('property_id', property.id)
    .gte('date', checkInDate)
    .lt('date', checkOutDate)
    .order('date');

  if (error) {
    console.error("Error fetching pricing:", error);
  }

  // Build daily prices array
  const dailyPrices: { date: string; price: number }[] = [];
  const pricingMap = new Map((pricing || []).map(p => [p.date, p.final_price]));
  
  let subtotal = 0;
  const currentDate = new Date(checkInDate);
  
  for (let i = 0; i < nights; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const price = pricingMap.get(dateStr) || property.pricePerNight;
    dailyPrices.push({ date: dateStr, price });
    subtotal += price;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const cleaningFee = property.cleaningFee || 0;
  const serviceFeePercentage = property.serviceFeePercentage || 0;
  const serviceFee = Math.round(subtotal * serviceFeePercentage / 100);
  const total = subtotal + cleaningFee + serviceFee;

  // Generate booking URL
  const baseUrl = siteUrl || '';
  const bookingUrl = `${baseUrl}/properties/${property.slug}?checkin=${checkInDate}&checkout=${checkOutDate}`;

  results.push({
    propertyId: property.id,
    propertyTitle: property.title,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    nights,
    dailyPrices,
    subtotal,
    cleaningFee,
    serviceFee,
    total,
    bookingUrl
  });

  return results;
}

/**
 * Generate booking link with pre-filled dates
 */
function getBookingLink(
  properties: PropertyContext[],
  propertyTitle: string,
  checkInDate: string,
  checkOutDate: string,
  siteUrl?: string
): { propertyTitle: string; bookingUrl: string } | null {
  const property = findPropertyByTitle(properties, propertyTitle);
  if (!property) {
    return null;
  }

  const baseUrl = siteUrl || '';
  const bookingUrl = `${baseUrl}/properties/${property.slug}?checkin=${checkInDate}&checkout=${checkOutDate}`;
  
  return {
    propertyTitle: property.title,
    bookingUrl
  };
}

/**
 * Process tool calls from the AI
 */
async function processToolCalls(
  supabase: ReturnType<typeof createClient>,
  properties: PropertyContext[],
  toolCalls: any[],
  siteUrl?: string
): Promise<string> {
  const results: string[] = [];

  for (const toolCall of toolCalls) {
    const { name, arguments: argsStr } = toolCall.function;
    const args = JSON.parse(argsStr);
    
    console.log(`Processing tool call: ${name}`, args);

    switch (name) {
      case 'check_availability': {
        const availabilityResults = await checkAvailability(
          supabase,
          properties,
          args.propertyTitle,
          args.checkInDate,
          args.checkOutDate
        );
        
        if (availabilityResults.length === 0) {
          results.push(`Could not find property "${args.propertyTitle}".`);
        } else {
          for (const result of availabilityResults) {
            if (result.isAvailable) {
              results.push(`✅ **${result.propertyTitle}** is AVAILABLE from ${args.checkInDate} to ${args.checkOutDate}.`);
            } else {
              results.push(`❌ **${result.propertyTitle}** is NOT available for those dates. There are existing bookings that conflict.`);
            }
          }
        }
        break;
      }
      
      case 'get_pricing_breakdown': {
        const pricingResults = await getPricingBreakdown(
          supabase,
          properties,
          args.propertyTitle,
          args.checkInDate,
          args.checkOutDate,
          siteUrl
        );
        
        if (pricingResults.length === 0) {
          results.push(`Could not calculate pricing. Please specify a valid property and date range.`);
        } else {
          for (const pricing of pricingResults) {
            let breakdown = `**Pricing for ${pricing.propertyTitle}** (${pricing.checkIn} to ${pricing.checkOut}):\n\n`;
            breakdown += `• **${pricing.nights} nights**: $${pricing.subtotal.toFixed(2)}`;
            
            // Show daily rates if they vary
            const uniquePrices = [...new Set(pricing.dailyPrices.map(p => p.price))];
            if (uniquePrices.length > 1) {
              breakdown += ` (rates vary by night)`;
            } else {
              breakdown += ` ($${uniquePrices[0]}/night)`;
            }
            
            if (pricing.cleaningFee > 0) {
              breakdown += `\n• **Cleaning fee**: $${pricing.cleaningFee.toFixed(2)}`;
            }
            if (pricing.serviceFee > 0) {
              breakdown += `\n• **Service fee**: $${pricing.serviceFee.toFixed(2)}`;
            }
            breakdown += `\n\n**Total: $${pricing.total.toFixed(2)}**`;
            breakdown += `\n\n[Book Now](${pricing.bookingUrl})`;
            
            results.push(breakdown);
          }
        }
        break;
      }
      
      case 'get_booking_link': {
        const linkResult = getBookingLink(
          properties,
          args.propertyTitle,
          args.checkInDate,
          args.checkOutDate,
          siteUrl
        );
        
        if (linkResult) {
          results.push(`Here's your booking link for **${linkResult.propertyTitle}**:\n\n[Click here to book](${linkResult.bookingUrl})\n\nThis link has your dates pre-filled (${args.checkInDate} to ${args.checkOutDate}).`);
        } else {
          results.push(`Could not find property "${args.propertyTitle}". Please check the property name and try again.`);
        }
        break;
      }
    }
  }

  return results.join('\n\n---\n\n');
}

/**
 * Aggregates property context for the AI assistant
 */
async function aggregatePropertyContext(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<PropertyContext[]> {
  console.log("Fetching properties for organization:", organizationId);

  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      description,
      location,
      city,
      bedrooms,
      bathrooms,
      max_guests,
      price_per_night,
      cleaning_fee,
      service_fee_percentage,
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

  const propertyIds = properties.map(p => p.id);
  const { data: accessDetails, error: accessError } = await supabase
    .from('property_access_details')
    .select('property_id, check_in_instructions, wifi_name')
    .in('property_id', propertyIds);

  if (accessError) {
    console.error("Error fetching access details:", accessError);
  }

  const accessMap = new Map(
    (accessDetails || []).map(ad => [ad.property_id, ad])
  );

  return properties.map(property => {
    const access = accessMap.get(property.id);
    return {
      id: property.id,
      title: property.title || '',
      slug: property.slug || property.id,
      description: property.description || '',
      location: property.location || '',
      city: property.city || '',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      maxGuests: property.max_guests || 0,
      pricePerNight: property.price_per_night || 0,
      cleaningFee: property.cleaning_fee || 0,
      serviceFeePercentage: property.service_fee_percentage || 0,
      amenities: property.amenities || '',
      checkInInstructions: access?.check_in_instructions || undefined,
      wifiName: access?.wifi_name || undefined,
    };
  });
}

/**
 * Builds the system prompt with property context and booking capabilities
 */
function buildSystemPrompt(properties: PropertyContext[], siteName?: string): string {
  const businessName = siteName || 'our vacation rental company';
  const propertyList = properties.map(p => `- ${p.title}`).join('\n');

  if (properties.length === 0) {
    return `You are a helpful AI assistant for ${businessName}. You help visitors with vacation rental inquiries.
    
Be friendly, concise, and helpful. If you don't have specific property information available, encourage visitors to contact the host directly or browse the website for details.

Standard policies:
- Check-in time: 4:00 PM
- Check-out time: 11:00 AM
- Pets: Contact host for pet policy
- Cancellation: Contact host for cancellation policy`;
  }

  const propertyContexts = properties.map(property => {
    const amenitiesList = property.amenities
      ? property.amenities.split(',').slice(0, 15).map(a => a.trim()).join(', ')
      : 'Contact host for amenities list';

    return `
## ${property.title}
- **Location**: ${property.location}${property.city ? `, ${property.city}` : ''}
- **Bedrooms**: ${property.bedrooms} | **Bathrooms**: ${property.bathrooms} | **Max Guests**: ${property.maxGuests}
- **Base Price**: $${property.pricePerNight}/night${property.cleaningFee > 0 ? ` + $${property.cleaningFee} cleaning fee` : ''}
- **Key Amenities**: ${amenitiesList}
${property.description ? `\n**Description**: ${property.description.substring(0, 500)}${property.description.length > 500 ? '...' : ''}` : ''}`;
  }).join('\n\n');

  return `You are a helpful AI booking assistant for ${businessName}. You have detailed knowledge of our properties and can help visitors check availability, get pricing, and book their stay.

# AVAILABLE PROPERTIES
${propertyList}

# PROPERTY DETAILS
${propertyContexts}

# BOOKING CAPABILITIES
You have access to real-time tools to help guests:
1. **check_availability** - Check if dates are available for a property
2. **get_pricing_breakdown** - Get detailed pricing including nightly rates, cleaning fee, service fee, and total
3. **get_booking_link** - Generate a direct booking link with pre-filled dates

When a guest mentions specific dates, USE THESE TOOLS to provide accurate, real-time information. Don't guess at availability or pricing - always use the tools.

# DATE PARSING
When guests mention dates like "next weekend", "December 20-25", "this Friday to Sunday", etc., convert them to YYYY-MM-DD format. Today's date context will help you calculate relative dates.

# STANDARD POLICIES
- **Check-in Time**: 4:00 PM
- **Check-out Time**: 11:00 AM  
- **Same-day turnover**: Yes, guests can check in on the same day another guest checks out
- **Cancellation**: Flexible - contact host for specific policy details
- **Pets**: Contact host to confirm pet policy for each property

# YOUR ROLE
- Help guests find available dates and understand pricing
- Proactively offer to check availability when dates are mentioned
- Provide booking links when guests are ready to book
- Answer questions about properties, amenities, and policies
- Be warm, helpful, and professional

# RESPONSE GUIDELINES
- Use the tools when guests ask about dates, availability, or pricing
- Keep responses concise but informative
- Include booking links when relevant
- If a property isn't found by name, list the available properties
- Encourage booking through the website for the best rates`;
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    let propertyContext: PropertyContext[] = [];
    let siteName: string | undefined;
    let siteUrl: string | undefined;
    let supabase: ReturnType<typeof createClient> | null = null;

    if (supabaseUrl && supabaseServiceKey && organizationId) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      propertyContext = await aggregatePropertyContext(supabase, organizationId);
      
      // Fetch organization name and website
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name, website')
        .eq('id', organizationId)
        .single();
      
      if (orgData) {
        siteName = orgData.name;
        siteUrl = orgData.website;
      }

      console.log(`Loaded context for ${propertyContext.length} properties, site: ${siteName}`);
    } else {
      console.log("Missing Supabase credentials or organizationId, using generic context");
    }

    const systemPrompt = buildSystemPrompt(propertyContext, siteName);
    
    // Add current date for relative date parsing
    const currentDate = new Date().toISOString().split('T')[0];
    const systemWithDate = `${systemPrompt}\n\n# CURRENT DATE\nToday is ${currentDate}. Use this to calculate relative dates like "next weekend", "this Friday", etc.`;

    const messages = [
      { role: "system", content: systemWithDate },
      ...conversationHistory.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log("Sending request to AI gateway with tools, messages:", messages.length);

    // First request - may return tool calls
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: propertyContext.length > 0 ? tools : undefined,
        tool_choice: propertyContext.length > 0 ? "auto" : undefined,
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
    const assistantMessage = data.choices?.[0]?.message;
    
    // Check if AI wants to use tools
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0 && supabase) {
      console.log("Processing tool calls:", assistantMessage.tool_calls.length);
      
      // Execute tools and get results
      const toolResults = await processToolCalls(
        supabase,
        propertyContext,
        assistantMessage.tool_calls,
        siteUrl
      );
      
      // Send results back to AI for final response
      const followUpMessages = [
        ...messages,
        assistantMessage,
        {
          role: "tool",
          tool_call_id: assistantMessage.tool_calls[0].id,
          content: toolResults
        }
      ];
      
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: followUpMessages,
        }),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const finalResponse = followUpData.choices?.[0]?.message?.content || toolResults;
        
        return new Response(
          JSON.stringify({ aiResponse: finalResponse }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // If follow-up fails, return tool results directly
      return new Response(
        JSON.stringify({ aiResponse: toolResults }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = assistantMessage?.content || "I'm sorry, I couldn't generate a response.";
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
