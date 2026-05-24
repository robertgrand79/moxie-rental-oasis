import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@^0.40.1";
import { CLAUDE_HAIKU, getAnthropicClient, extractText } from "../_shared/anthropicClient.ts";
import { checkAiRateLimit, organizationIdFromAuth, rateLimitResponse } from "../_shared/aiRateLimit.ts";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ContentType = 'blog_post' | 'newsletter' | 'property' | 'point_of_interest' | 'lifestyle_gallery' | 'testimonial' | 'event';
type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin';

const platformPrompts: Record<Platform, string> = {
  instagram: `Create an engaging Instagram caption for a vacation rental company. 
Include relevant emojis throughout the text, 5-10 relevant hashtags at the end.
Make it visual and storytelling-focused. Keep it under 2200 characters.
Include a call-to-action like "Book your stay" or "Link in bio".`,

  facebook: `Create a Facebook post for a vacation rental company.
Make it conversational and warm. Include a question to encourage engagement.
Include a clear call-to-action. Can be longer form with good paragraph breaks.
Add 2-3 relevant emojis but don't overdo it.`,

  twitter: `Create a tweet for a vacation rental company.
Maximum 280 characters total. Make it punchy, engaging and shareable.
Include 1-2 relevant hashtags. Use emojis sparingly (1-2 max).`,

  linkedin: `Create a LinkedIn post for a vacation rental company.
Professional yet personable tone. Focus on the experience, value, or unique aspects.
Can include hospitality industry insights or travel tips.
Use proper formatting with line breaks for readability.`
};

async function fetchContent(supabase: any, contentType: ContentType, contentId: string): Promise<string> {
  let content = '';
  
  switch (contentType) {
    case 'blog_post': {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, excerpt, content, tags')
        .eq('id', contentId)
        .single();
      if (data) {
        content = `Title: ${data.title}\nExcerpt: ${data.excerpt}\nContent: ${data.content?.substring(0, 1000) || ''}\nTags: ${data.tags?.join(', ') || ''}`;
      }
      break;
    }
    case 'newsletter': {
      const { data } = await supabase
        .from('newsletter_campaigns')
        .select('subject, content')
        .eq('id', contentId)
        .single();
      if (data) {
        content = `Subject: ${data.subject}\nContent: ${data.content?.substring(0, 1000) || ''}`;
      }
      break;
    }
    case 'property': {
      const { data } = await supabase
        .from('properties')
        .select('title, description, location, bedrooms, bathrooms, max_guests, amenities')
        .eq('id', contentId)
        .single();
      if (data) {
        content = `Property: ${data.title}\nDescription: ${data.description || ''}\nLocation: ${data.location || ''}\nBedrooms: ${data.bedrooms}, Bathrooms: ${data.bathrooms}, Sleeps: ${data.max_guests}\nAmenities: ${data.amenities || ''}`;
      }
      break;
    }
    case 'point_of_interest': {
      const { data } = await supabase
        .from('points_of_interest')
        .select('name, description, category, address')
        .eq('id', contentId)
        .single();
      if (data) {
        content = `Place: ${data.name}\nCategory: ${data.category || ''}\nDescription: ${data.description || ''}\nAddress: ${data.address || ''}`;
      }
      break;
    }
    case 'lifestyle_gallery': {
      const { data } = await supabase
        .from('lifestyle_gallery')
        .select('title, description, category, activity_type, location')
        .eq('id', contentId)
        .single();
      if (data) {
        content = `Title: ${data.title}\nDescription: ${data.description || ''}\nCategory: ${data.category}\nActivity: ${data.activity_type || ''}\nLocation: ${data.location || ''}`;
      }
      break;
    }
    case 'testimonial': {
      const { data } = await supabase
        .from('testimonials')
        .select('guest_name, review_text, rating, property_name')
        .eq('id', contentId)
        .single();
      if (data) {
        content = `Guest Review from ${data.guest_name}\nProperty: ${data.property_name || 'Our vacation rental'}\nRating: ${data.rating}/5 stars\nReview: ${data.review_text}`;
      }
      break;
    }
    case 'event': {
      const { data } = await supabase
        .from('eugene_events')
        .select('title, description, event_date, location, category')
        .eq('id', contentId)
        .single();
      if (data) {
        content = `Event: ${data.title}\nDate: ${data.event_date}\nLocation: ${data.location || ''}\nCategory: ${data.category || ''}\nDescription: ${data.description || ''}`;
      }
      break;
    }
  }
  
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orgId = await organizationIdFromAuth(req);
    const rateLimit = await checkAiRateLimit(orgId, "admin_content_gen");
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit, corsHeaders);
    }

    const { contentType, contentId, platform } = await req.json();

    
    if (!contentType || !contentId || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: contentType, contentId, platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Deno.env.get('ANTHROPIC_API_KEY')) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the content
    const content = await fetchContent(supabase, contentType as ContentType, contentId);
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const platformPrompt = platformPrompts[platform as Platform];
    
    const systemPrompt = `You are a social media expert for vacation rental companies. 
You create engaging, authentic posts that drive bookings and engagement.
Always maintain a warm, inviting tone that reflects hospitality.
Never use generic filler content - make every word count.`;

    const userPrompt = `${platformPrompt}

Based on this content, create a social media post:

${content}

Generate ONLY the post content, ready to copy and paste. No explanations or alternatives.`;

    console.log('Generating social post for:', { contentType, platform });

    const anthropic = getAnthropicClient();
    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create({
        model: CLAUDE_HAIKU,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (error instanceof Anthropic.APIError) {
        console.error('Anthropic API error:', error.status, error.message);
        return new Response(
          JSON.stringify({ error: `AI request failed (${error.status}): ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    const generatedPost = extractText(response);

    console.log('Successfully generated social post');

    return new Response(
      JSON.stringify({ post: generatedPost }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-social-post:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
