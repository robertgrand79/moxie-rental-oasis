import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl } = await req.json();

    if (!websiteUrl) {
      return new Response(
        JSON.stringify({ error: 'Website URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[fetch-website-image] Fetching image from: ${websiteUrl}`);

    // Fetch the webpage
    const pageResponse = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageFetcher/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch website: ${pageResponse.status}`);
    }

    const html = await pageResponse.text();

    // Extract og:image first (most reliable for event images)
    let imageUrl: string | null = null;

    // Try og:image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    
    if (ogImageMatch) {
      imageUrl = ogImageMatch[1];
      console.log(`[fetch-website-image] Found og:image: ${imageUrl}`);
    }

    // Try twitter:image if no og:image
    if (!imageUrl) {
      const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
      if (twitterMatch) {
        imageUrl = twitterMatch[1];
        console.log(`[fetch-website-image] Found twitter:image: ${imageUrl}`);
      }
    }

    // Try first large image in content if no meta images
    if (!imageUrl) {
      const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
      for (const match of imgMatches) {
        const src = match[1];
        // Skip small icons, tracking pixels, and data URIs
        if (src && 
            !src.includes('icon') && 
            !src.includes('logo') && 
            !src.includes('pixel') &&
            !src.includes('tracking') &&
            !src.startsWith('data:') &&
            (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp'))) {
          imageUrl = src;
          console.log(`[fetch-website-image] Found img tag: ${imageUrl}`);
          break;
        }
      }
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'No suitable image found on the website' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve relative URLs
    if (imageUrl.startsWith('/')) {
      const url = new URL(websiteUrl);
      imageUrl = `${url.origin}${imageUrl}`;
    } else if (!imageUrl.startsWith('http')) {
      const url = new URL(websiteUrl);
      imageUrl = `${url.origin}/${imageUrl}`;
    }

    console.log(`[fetch-website-image] Downloading image: ${imageUrl}`);

    // Download the image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageFetcher/1.0)',
        'Accept': 'image/*',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Determine file extension
    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('gif')) extension = 'gif';

    // Generate unique filename
    const filename = `event-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hero-images')
      .upload(`events/${filename}`, imageBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error(`[fetch-website-image] Upload error:`, uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('hero-images')
      .getPublicUrl(`events/${filename}`);

    console.log(`[fetch-website-image] Success! Image uploaded to: ${publicUrlData.publicUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrlData.publicUrl,
        originalUrl: imageUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[fetch-website-image] Error:`, error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
