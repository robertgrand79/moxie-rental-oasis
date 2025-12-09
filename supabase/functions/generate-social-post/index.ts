import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { contentType, contentId, platform } = await req.json();
    
    if (!contentType || !contentId || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: contentType, contentId, platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (response.status === 429) {
      console.error('Rate limit exceeded');
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (response.status === 402) {
      console.error('Payment required - AI credits exhausted');
      return new Response(
        JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedPost = data.choices?.[0]?.message?.content || '';

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
