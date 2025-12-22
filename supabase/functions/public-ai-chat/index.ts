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
  state: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFeePercentage: number;
  amenities: string[];
  propertyType: string;
}

interface GuidebookContent {
  welcomeMessage?: string;
  checkInInstructions?: string;
  checkOutInstructions?: string;
  houseRules?: string[];
  wifiDetails?: { networkName?: string; password?: string };
  amenities?: string[];
  localRecommendations?: {
    restaurants?: { name: string; description?: string }[];
    activities?: { name: string; description?: string }[];
    shopping?: { name: string; description?: string }[];
  };
  emergencyContacts?: { name: string; phone: string; role?: string }[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface AssistantConfig {
  personality: string;
  faqs: FAQ[];
  displayName: string;
}

interface POI {
  name: string;
  category: string;
  description: string;
  address: string;
  distance: string;
  phone: string;
  website: string;
  hours?: string;
}

interface LocalEvent {
  title: string;
  event_date: string;
  time_start: string;
  location: string;
  description: string;
  ticket_url: string;
}

interface PropertyDocument {
  title: string;
  document_type: string;
  extracted_text: string;
  property_id: string | null;
}

interface SiteSettings {
  siteName?: string;
  tagline?: string;
  description?: string;
  aboutDescription?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
}

const PERSONALITY_PROMPTS: Record<string, string> = {
  friendly: "Be warm, conversational, and approachable. Use a friendly tone with occasional light humor. Make guests feel welcome and comfortable asking questions.",
  professional: "Maintain a polished, professional tone. Be courteous and efficient. Focus on providing accurate, detailed information while remaining helpful.",
  casual: "Be relaxed and informal. Use everyday language and contractions. Feel free to be personable and create a laid-back atmosphere.",
  concise: "Be brief and to the point. Provide essential information without unnecessary elaboration. Prioritize clarity and efficiency in responses."
};

// Tool definitions for the AI
const tools = [
  {
    type: "function",
    function: {
      name: "check_availability",
      description: "Check if a property is available for specific dates.",
      parameters: {
        type: "object",
        properties: {
          propertyTitle: { type: "string", description: "The name/title of the property" },
          checkInDate: { type: "string", description: "Check-in date in YYYY-MM-DD format" },
          checkOutDate: { type: "string", description: "Check-out date in YYYY-MM-DD format" }
        },
        required: ["checkInDate", "checkOutDate"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_pricing_breakdown",
      description: "Get detailed pricing breakdown for a stay.",
      parameters: {
        type: "object",
        properties: {
          propertyTitle: { type: "string", description: "The name/title of the property" },
          checkInDate: { type: "string", description: "Check-in date in YYYY-MM-DD format" },
          checkOutDate: { type: "string", description: "Check-out date in YYYY-MM-DD format" }
        },
        required: ["checkInDate", "checkOutDate"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_booking_link",
      description: "Generate a direct booking link with pre-filled dates.",
      parameters: {
        type: "object",
        properties: {
          propertyTitle: { type: "string", description: "The name/title of the property" },
          checkInDate: { type: "string", description: "Check-in date in YYYY-MM-DD format" },
          checkOutDate: { type: "string", description: "Check-out date in YYYY-MM-DD format" }
        },
        required: ["propertyTitle", "checkInDate", "checkOutDate"]
      }
    }
  }
];

function findPropertyByTitle(properties: PropertyContext[], searchTitle?: string): PropertyContext | null {
  if (!searchTitle) return properties.length === 1 ? properties[0] : null;
  const lowerSearch = searchTitle.toLowerCase();
  return properties.find(p => p.title.toLowerCase().includes(lowerSearch) || lowerSearch.includes(p.title.toLowerCase())) 
    || properties.find(p => lowerSearch.split(/\s+/).some(word => p.title.toLowerCase().includes(word) && word.length > 3))
    || null;
}

async function checkAvailability(
  supabase: ReturnType<typeof createClient>,
  properties: PropertyContext[],
  propertyTitle: string | undefined,
  checkInDate: string,
  checkOutDate: string
) {
  const propertiesToCheck = propertyTitle 
    ? [findPropertyByTitle(properties, propertyTitle)].filter(Boolean) as PropertyContext[]
    : properties;
  
  if (propertiesToCheck.length === 0) {
    return [{ propertyTitle: propertyTitle || 'Unknown', isAvailable: false, conflicts: [{ blockType: 'Property not found' }] }];
  }

  const results = [];
  for (const property of propertiesToCheck) {
    const { data: blocks } = await supabase
      .from('availability_blocks')
      .select('start_date, end_date, block_type')
      .eq('property_id', property.id)
      .lte('start_date', checkOutDate)
      .gte('end_date', checkInDate);

    const conflicts = (blocks || []).filter(b => b.block_type === 'booked' || b.block_type === 'blocked');
    results.push({ propertyId: property.id, propertyTitle: property.title, isAvailable: conflicts.length === 0, conflicts });
  }
  return results;
}

async function getPricingBreakdown(
  supabase: ReturnType<typeof createClient>,
  properties: PropertyContext[],
  propertyTitle: string | undefined,
  checkInDate: string,
  checkOutDate: string,
  siteUrl?: string
) {
  const property = findPropertyByTitle(properties, propertyTitle);
  if (!property) return [];

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  if (nights <= 0) return [];

  const { data: pricing } = await supabase
    .from('dynamic_pricing')
    .select('date, final_price')
    .eq('property_id', property.id)
    .gte('date', checkInDate)
    .lt('date', checkOutDate)
    .order('date');

  const pricingMap = new Map((pricing || []).map(p => [p.date, p.final_price]));
  const dailyPrices: { date: string; price: number }[] = [];
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
  const serviceFee = Math.round(subtotal * (property.serviceFeePercentage || 0) / 100);
  const bookingUrl = `${siteUrl || ''}/properties/${property.slug}?checkin=${checkInDate}&checkout=${checkOutDate}`;

  return [{
    propertyTitle: property.title,
    nights,
    dailyPrices,
    subtotal,
    cleaningFee,
    serviceFee,
    total: subtotal + cleaningFee + serviceFee,
    bookingUrl
  }];
}

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

    switch (name) {
      case 'check_availability': {
        const availResults = await checkAvailability(supabase, properties, args.propertyTitle, args.checkInDate, args.checkOutDate);
        for (const r of availResults) {
          results.push(r.isAvailable 
            ? `✅ **${r.propertyTitle}** is AVAILABLE from ${args.checkInDate} to ${args.checkOutDate}.`
            : `❌ **${r.propertyTitle}** is NOT available for those dates.`);
        }
        break;
      }
      case 'get_pricing_breakdown': {
        const pricingResults = await getPricingBreakdown(supabase, properties, args.propertyTitle, args.checkInDate, args.checkOutDate, siteUrl);
        for (const p of pricingResults) {
          let breakdown = `**Pricing for ${p.propertyTitle}** (${args.checkInDate} to ${args.checkOutDate}):\n\n`;
          breakdown += `• **${p.nights} nights**: $${p.subtotal.toFixed(2)}`;
          if (p.cleaningFee > 0) breakdown += `\n• **Cleaning fee**: $${p.cleaningFee.toFixed(2)}`;
          if (p.serviceFee > 0) breakdown += `\n• **Service fee**: $${p.serviceFee.toFixed(2)}`;
          breakdown += `\n\n**Total: $${p.total.toFixed(2)}**\n\n[Book Now](${p.bookingUrl})`;
          results.push(breakdown);
        }
        break;
      }
      case 'get_booking_link': {
        const property = findPropertyByTitle(properties, args.propertyTitle);
        if (property) {
          const url = `${siteUrl || ''}/properties/${property.slug}?checkin=${args.checkInDate}&checkout=${args.checkOutDate}`;
          results.push(`Here's your booking link for **${property.title}**:\n\n[Click here to book](${url})`);
        } else {
          results.push(`Could not find property "${args.propertyTitle}".`);
        }
        break;
      }
    }
  }
  return results.join('\n\n---\n\n');
}

async function aggregatePropertyContext(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<PropertyContext[]> {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, slug, description, location, city, state, address, bedrooms, bathrooms, max_guests, price_per_night, cleaning_fee, service_fee_percentage, amenities, property_type')
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  return (properties || []).map(p => ({
    id: p.id,
    title: p.title || '',
    slug: p.slug || p.id,
    description: p.description || '',
    location: p.location || '',
    city: p.city || '',
    state: p.state || '',
    address: p.address || '',
    bedrooms: p.bedrooms || 0,
    bathrooms: p.bathrooms || 0,
    maxGuests: p.max_guests || 0,
    pricePerNight: p.price_per_night || 0,
    cleaningFee: p.cleaning_fee || 0,
    serviceFeePercentage: p.service_fee_percentage || 0,
    amenities: Array.isArray(p.amenities) ? p.amenities : (p.amenities ? String(p.amenities).split(',').map(a => a.trim()) : []),
    propertyType: p.property_type || 'Vacation Rental',
  }));
}

async function fetchGuidebooks(
  supabase: ReturnType<typeof createClient>,
  propertyIds: string[]
): Promise<Map<string, GuidebookContent>> {
  if (propertyIds.length === 0) return new Map();
  
  const { data } = await supabase
    .from('property_guidebooks')
    .select('property_id, content')
    .in('property_id', propertyIds)
    .eq('is_active', true);
  
  const map = new Map<string, GuidebookContent>();
  for (const g of data || []) {
    if (g.content) {
      map.set(g.property_id, g.content as unknown as GuidebookContent);
    }
  }
  return map;
}

async function fetchPOIs(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<POI[]> {
  const { data } = await supabase
    .from('places')
    .select('name, category, description, address, distance_from_properties, phone, website_url')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .limit(50);
  
  return (data || []).map(p => ({
    name: p.name,
    category: p.category || '',
    description: p.description || '',
    address: p.address || '',
    distance: p.distance_from_properties || '',
    phone: p.phone || '',
    website: p.website_url || '',
  })) as POI[];
}

async function fetchLocalEvents(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<LocalEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('eugene_events')
    .select('title, event_date, time_start, location, description, ticket_url')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(30);
  
  return (data || []) as LocalEvent[];
}

async function fetchPropertyDocuments(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<PropertyDocument[]> {
  const { data } = await supabase
    .from('property_documents')
    .select('title, document_type, extracted_text, property_id')
    .eq('organization_id', organizationId)
    .not('extracted_text', 'is', null);
  
  return (data || []) as PropertyDocument[];
}

async function fetchSiteSettings(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<SiteSettings> {
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('organization_id', organizationId);
  
  const settings: SiteSettings = {};
  for (const setting of data || []) {
    try {
      settings[setting.key as keyof SiteSettings] = 
        typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch {
      settings[setting.key as keyof SiteSettings] = setting.value;
    }
  }
  return settings;
}

async function fetchAssistantConfig(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<AssistantConfig> {
  const { data } = await supabase
    .from('assistant_settings')
    .select('personality, custom_faqs, display_name')
    .eq('organization_id', organizationId)
    .single();

  return {
    personality: data?.personality || 'friendly',
    faqs: (data?.custom_faqs as FAQ[]) || [],
    displayName: data?.display_name || 'Stay Moxie Assistant'
  };
}

async function logConversation(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  sessionId: string,
  userMessage: string,
  assistantResponse: string,
  toolCalls?: any[]
) {
  try {
    let { data: conversation } = await supabase
      .from('assistant_conversations')
      .select('id, message_count')
      .eq('session_id', sessionId)
      .single();

    if (!conversation) {
      const { data: newConvo } = await supabase
        .from('assistant_conversations')
        .insert({ organization_id: organizationId, session_id: sessionId })
        .select('id, message_count')
        .single();
      conversation = newConvo;
    }

    if (conversation) {
      await supabase.from('assistant_messages').insert([
        { conversation_id: conversation.id, role: 'user', content: userMessage },
        { conversation_id: conversation.id, role: 'assistant', content: assistantResponse, tool_calls: toolCalls }
      ]);

      await supabase
        .from('assistant_conversations')
        .update({ message_count: (conversation.message_count || 0) + 2 })
        .eq('id', conversation.id);
    }
  } catch (err) {
    console.error("Error logging conversation:", err);
  }
}

function buildSystemPrompt(
  properties: PropertyContext[],
  guidebooks: Map<string, GuidebookContent>,
  pois: POI[],
  events: LocalEvent[],
  documents: PropertyDocument[],
  siteSettings: SiteSettings,
  config: AssistantConfig,
  siteName?: string
): string {
  const businessName = siteSettings.siteName || siteName || 'our vacation rental company';
  const personalityPrompt = PERSONALITY_PROMPTS[config.personality] || PERSONALITY_PROMPTS.friendly;

  let prompt = `You are ${config.displayName}, a knowledgeable AI concierge for ${businessName}. ${personalityPrompt}

`;

  // About section
  if (siteSettings.tagline || siteSettings.description || siteSettings.aboutDescription) {
    prompt += `# ABOUT ${businessName.toUpperCase()}\n`;
    if (siteSettings.tagline) prompt += `${siteSettings.tagline}\n`;
    if (siteSettings.description) prompt += `${siteSettings.description}\n`;
    if (siteSettings.aboutDescription) prompt += `${siteSettings.aboutDescription}\n`;
    prompt += '\n';
  }

  // Contact info
  if (siteSettings.contactEmail || siteSettings.phone || siteSettings.address) {
    prompt += `# CONTACT INFORMATION\n`;
    if (siteSettings.contactEmail) prompt += `- Email: ${siteSettings.contactEmail}\n`;
    if (siteSettings.phone) prompt += `- Phone: ${siteSettings.phone}\n`;
    if (siteSettings.address) prompt += `- Address: ${siteSettings.address}\n`;
    prompt += '\n';
  }

  // Properties section with full details
  if (properties.length > 0) {
    prompt += `# OUR PROPERTIES\n\n`;
    
    for (const p of properties) {
      const guidebook = guidebooks.get(p.id);
      const propertyDocs = documents.filter(d => d.property_id === p.id);
      
      prompt += `## ${p.title}\n`;
      prompt += `- **Location**: ${p.address || p.location}${p.city ? `, ${p.city}` : ''}${p.state ? `, ${p.state}` : ''}\n`;
      prompt += `- **Type**: ${p.propertyType}\n`;
      prompt += `- **Accommodations**: ${p.bedrooms} bedrooms, ${p.bathrooms} bathrooms, sleeps ${p.maxGuests} guests\n`;
      prompt += `- **Pricing**: $${p.pricePerNight}/night${p.cleaningFee > 0 ? ` + $${p.cleaningFee} cleaning fee` : ''}\n`;
      
      if (p.description) {
        prompt += `- **Description**: ${p.description}\n`;
      }
      
      if (p.amenities.length > 0) {
        prompt += `- **Amenities**: ${p.amenities.join(', ')}\n`;
      }
      
      // Guidebook details
      if (guidebook) {
        prompt += `\n### House Details for ${p.title}\n`;
        
        if (guidebook.welcomeMessage) {
          prompt += `**Welcome**: ${guidebook.welcomeMessage}\n`;
        }
        if (guidebook.checkInInstructions) {
          prompt += `**Check-in**: ${guidebook.checkInInstructions}\n`;
        }
        if (guidebook.checkOutInstructions) {
          prompt += `**Check-out**: ${guidebook.checkOutInstructions}\n`;
        }
        if (guidebook.houseRules && guidebook.houseRules.length > 0) {
          prompt += `**House Rules**: ${guidebook.houseRules.join('; ')}\n`;
        }
        if (guidebook.wifiDetails) {
          prompt += `**WiFi**: Network: ${guidebook.wifiDetails.networkName || 'Ask host'}, Password: ${guidebook.wifiDetails.password || 'Ask host'}\n`;
        }
        if (guidebook.emergencyContacts && guidebook.emergencyContacts.length > 0) {
          prompt += `**Emergency Contacts**: ${guidebook.emergencyContacts.map(c => `${c.name} (${c.role || 'Contact'}): ${c.phone}`).join(', ')}\n`;
        }
        
        // Guidebook local recommendations
        if (guidebook.localRecommendations) {
          const recs = guidebook.localRecommendations;
          if (recs.restaurants && recs.restaurants.length > 0) {
            prompt += `**Host's Restaurant Picks**: ${recs.restaurants.map(r => r.name).join(', ')}\n`;
          }
          if (recs.activities && recs.activities.length > 0) {
            prompt += `**Host's Activity Picks**: ${recs.activities.map(a => a.name).join(', ')}\n`;
          }
        }
      }
      
      // Property-specific documents
      if (propertyDocs.length > 0) {
        prompt += `\n### Additional Information for ${p.title}\n`;
        for (const doc of propertyDocs) {
          prompt += `[${doc.document_type || 'Document'}: ${doc.title}]\n${doc.extracted_text}\n\n`;
        }
      }
      
      prompt += '\n';
    }
  }

  // Points of Interest section
  if (pois.length > 0) {
    prompt += `# LOCAL AREA - PLACES TO VISIT\n\n`;
    
    const poiByCategory: Record<string, POI[]> = {};
    for (const poi of pois) {
      const cat = poi.category || 'Other';
      if (!poiByCategory[cat]) poiByCategory[cat] = [];
      poiByCategory[cat].push(poi);
    }
    
    for (const [category, categoryPois] of Object.entries(poiByCategory)) {
      prompt += `## ${category}\n`;
      for (const poi of categoryPois) {
        prompt += `- **${poi.name}**`;
        if (poi.distance) prompt += ` (${poi.distance})`;
        prompt += '\n';
        if (poi.description) prompt += `  ${poi.description}\n`;
        if (poi.address) prompt += `  Address: ${poi.address}\n`;
        if (poi.hours) prompt += `  Hours: ${poi.hours}\n`;
        if (poi.phone) prompt += `  Phone: ${poi.phone}\n`;
      }
      prompt += '\n';
    }
  }

  // Events section
  if (events.length > 0) {
    prompt += `# UPCOMING LOCAL EVENTS\n\n`;
    for (const event of events.slice(0, 10)) {
      prompt += `- **${event.title}** - ${event.event_date}`;
      if (event.time_start) prompt += ` at ${event.time_start}`;
      prompt += '\n';
      if (event.location) prompt += `  Location: ${event.location}\n`;
      if (event.description) {
        const desc = event.description.length > 150 ? event.description.substring(0, 150) + '...' : event.description;
        prompt += `  ${desc}\n`;
      }
      if (event.ticket_url) prompt += `  Tickets: ${event.ticket_url}\n`;
    }
    prompt += '\n';
  }

  // Organization-wide documents
  const orgDocs = documents.filter(d => !d.property_id);
  if (orgDocs.length > 0) {
    prompt += `# ADDITIONAL INFORMATION\n\n`;
    for (const doc of orgDocs) {
      prompt += `## ${doc.title} (${doc.document_type || 'General'})\n${doc.extracted_text}\n\n`;
    }
  }

  // Custom FAQs
  if (config.faqs.length > 0) {
    prompt += `# FREQUENTLY ASKED QUESTIONS\n\n`;
    for (const faq of config.faqs) {
      prompt += `**Q: ${faq.question}**\nA: ${faq.answer}\n\n`;
    }
  }

  // Policies and behavior
  prompt += `# POLICIES
- Standard check-in: 4:00 PM | Check-out: 11:00 AM (unless specified otherwise in property details)
- Same-day turnover is allowed
- Pets: Contact host to confirm pet policy
- Direct booking is encouraged for best rates

# YOUR BEHAVIOR
- You have comprehensive knowledge about all properties, the local area, events, and recommendations
- When asked about a specific property, provide detailed information from above
- Use your tools to check real-time availability and pricing when guests ask about dates
- Recommend local restaurants, activities, and events based on the POI and events data
- If you genuinely don't have specific information, offer to connect them with the host
- Keep responses helpful, informative, and ${config.personality}
- Never make up information that isn't provided above

# MULTI-LANGUAGE SUPPORT
- IMPORTANT: Detect the language the user is writing in and RESPOND IN THE SAME LANGUAGE
- If the user writes in Spanish, respond in Spanish. If they write in French, respond in French, etc.
- Maintain your helpful and friendly tone regardless of the language
- If you're unsure about the language, default to English but offer to communicate in their preferred language`;

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], organizationId, sessionId, language } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    let propertyContext: PropertyContext[] = [];
    let guidebooks = new Map<string, GuidebookContent>();
    let pois: POI[] = [];
    let events: LocalEvent[] = [];
    let documents: PropertyDocument[] = [];
    let siteSettings: SiteSettings = {};
    let siteName: string | undefined;
    let siteUrl: string | undefined;
    let assistantConfig: AssistantConfig = { personality: 'friendly', faqs: [], displayName: 'Stay Moxie Assistant' };
    let supabase: ReturnType<typeof createClient> | null = null;

    if (supabaseUrl && supabaseServiceKey && organizationId) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Fetch all context in parallel for efficiency
      const [
        propertiesResult,
        poisResult,
        eventsResult,
        documentsResult,
        siteSettingsResult,
        assistantConfigResult,
        orgResult
      ] = await Promise.all([
        aggregatePropertyContext(supabase, organizationId),
        fetchPOIs(supabase, organizationId),
        fetchLocalEvents(supabase, organizationId),
        fetchPropertyDocuments(supabase, organizationId),
        fetchSiteSettings(supabase, organizationId),
        fetchAssistantConfig(supabase, organizationId),
        supabase.from('organizations').select('name, website').eq('id', organizationId).single()
      ]);
      
      propertyContext = propertiesResult;
      pois = poisResult;
      events = eventsResult;
      documents = documentsResult;
      siteSettings = siteSettingsResult;
      assistantConfig = assistantConfigResult;
      
      // Fetch guidebooks for properties
      if (propertyContext.length > 0) {
        guidebooks = await fetchGuidebooks(supabase, propertyContext.map(p => p.id));
      }
      
      if (orgResult.data) {
        siteName = orgResult.data.name;
        siteUrl = orgResult.data.website;
      }

      console.log('Fetched comprehensive context:', {
        properties: propertyContext.length,
        guidebooks: guidebooks.size,
        pois: pois.length,
        events: events.length,
        documents: documents.length,
        siteSettings: Object.keys(siteSettings).length
      });
    }

    const systemPrompt = buildSystemPrompt(
      propertyContext, 
      guidebooks, 
      pois, 
      events, 
      documents, 
      siteSettings, 
      assistantConfig, 
      siteName
    );
    const currentDate = new Date().toISOString().split('T')[0];

    console.log('System prompt length:', systemPrompt.length);

    const messages = [
      { role: "system", content: `${systemPrompt}\n\nToday is ${currentDate}.` },
      ...conversationHistory.map((msg: Message) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: propertyContext.length > 0 ? tools : undefined,
        tool_choice: propertyContext.length > 0 ? "auto" : undefined,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Too many requests. Please try again." }), 
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), 
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;
    let aiResponse: string;
    let toolCallsUsed: any[] | undefined;

    if (assistantMessage?.tool_calls?.length > 0 && supabase) {
      toolCallsUsed = assistantMessage.tool_calls;
      const toolResults = await processToolCalls(supabase, propertyContext, assistantMessage.tool_calls, siteUrl);
      
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [...messages, assistantMessage, { role: "tool", tool_call_id: assistantMessage.tool_calls[0].id, content: toolResults }],
        }),
      });

      aiResponse = followUpResponse.ok 
        ? (await followUpResponse.json()).choices?.[0]?.message?.content || toolResults
        : toolResults;
    } else {
      aiResponse = assistantMessage?.content || "I'm sorry, I couldn't generate a response.";
    }

    // Log conversation
    if (supabase && organizationId && sessionId) {
      logConversation(supabase, organizationId, sessionId, message, aiResponse, toolCallsUsed);
    }

    return new Response(JSON.stringify({ aiResponse }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Public AI chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
