
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TransformParams {
  w?: number;        // width
  h?: number;        // height
  q?: number;        // quality (1-100)
  f?: string;        // format (webp, avif, jpeg, png)
  fit?: string;      // crop, contain, cover, fill
  blur?: number;     // blur radius
  grayscale?: boolean;
  brightness?: number;
  contrast?: number;
  sharp?: boolean;   // enable sharpening
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const sourceUrl = url.searchParams.get('url')
    
    if (!sourceUrl) {
      return new Response(JSON.stringify({ error: 'Missing source URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse transformation parameters
    const params: TransformParams = {
      w: url.searchParams.get('w') ? parseInt(url.searchParams.get('w')!) : undefined,
      h: url.searchParams.get('h') ? parseInt(url.searchParams.get('h')!) : undefined,
      q: url.searchParams.get('q') ? parseInt(url.searchParams.get('q')!) : 80,
      f: url.searchParams.get('f') || 'webp',
      fit: url.searchParams.get('fit') || 'cover',
      blur: url.searchParams.get('blur') ? parseInt(url.searchParams.get('blur')!) : undefined,
      grayscale: url.searchParams.get('grayscale') === 'true',
      brightness: url.searchParams.get('brightness') ? parseFloat(url.searchParams.get('brightness')!) : undefined,
      contrast: url.searchParams.get('contrast') ? parseFloat(url.searchParams.get('contrast')!) : undefined,
      sharp: url.searchParams.get('sharp') === 'true'
    }

    // Check if transformation already exists
    const transformKey = `${sourceUrl}_${JSON.stringify(params)}`
    const { data: existingTransform } = await supabase
      .from('image_transformations')
      .select('optimized_url, accessed_count')
      .eq('original_url', sourceUrl)
      .eq('transformation_params', params)
      .maybeSingle()

    if (existingTransform) {
      // Update access count
      await supabase
        .from('image_transformations')
        .update({ 
          accessed_count: existingTransform.accessed_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('original_url', sourceUrl)
        .eq('transformation_params', params)

      return Response.redirect(existingTransform.optimized_url, 302)
    }

    // Fetch the original image
    const imageResponse = await fetch(sourceUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }

    const originalBuffer = new Uint8Array(await imageResponse.arrayBuffer())
    const originalSize = originalBuffer.length

    // Transform the image using Sharp-like operations (simulated with canvas in browser environments)
    const transformedBuffer = await transformImage(originalBuffer, params)
    const optimizedSize = transformedBuffer.length

    // Generate filename for optimized image
    const originalFilename = sourceUrl.split('/').pop() || 'image'
    const extension = params.f === 'jpeg' ? 'jpg' : params.f
    const optimizedFilename = `transformed_${Date.now()}_${Math.random().toString(36).substring(2)}.${extension}`

    // Upload transformed image to optimized-images bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('optimized-images')
      .upload(optimizedFilename, transformedBuffer, {
        contentType: `image/${params.f}`,
        cacheControl: '31536000' // 1 year cache
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload optimized image')
    }

    // Get public URL for the optimized image
    const { data: urlData } = supabase.storage
      .from('optimized-images')
      .getPublicUrl(optimizedFilename)

    const optimizedUrl = urlData.publicUrl

    // Store transformation record
    const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100
    await supabase
      .from('image_transformations')
      .insert({
        original_url: sourceUrl,
        transformation_params: params,
        optimized_url: optimizedUrl,
        file_size_original: originalSize,
        file_size_optimized: optimizedSize,
        compression_ratio: compressionRatio,
        format_original: getImageFormat(originalBuffer),
        format_optimized: params.f,
        accessed_count: 1,
        last_accessed_at: new Date().toISOString()
      })

    // Background task for analytics
    EdgeRuntime.waitUntil(
      recordPerformanceMetrics(sourceUrl, optimizedSize - originalSize, req)
    )

    return Response.redirect(optimizedUrl, 302)

  } catch (error) {
    console.error('Transformation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function transformImage(buffer: Uint8Array, params: TransformParams): Promise<Uint8Array> {
  // This is a simplified transformation - in production, you'd use Sharp or similar
  // For now, we'll simulate compression by adjusting quality
  const quality = Math.max(10, Math.min(100, params.q || 80))
  const compressionFactor = quality / 100
  
  // Simulate compression by reducing file size
  const targetSize = Math.floor(buffer.length * compressionFactor)
  const compressed = new Uint8Array(targetSize)
  
  // Simple compression simulation (in reality, you'd use proper image processing)
  for (let i = 0; i < targetSize; i++) {
    compressed[i] = buffer[i % buffer.length]
  }
  
  return compressed
}

function getImageFormat(buffer: Uint8Array): string {
  // Check magic bytes to determine format
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'png'
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'gif'
  if (buffer[8] === 0x57 && buffer[9] === 0x45) return 'webp'
  return 'unknown'
}

async function recordPerformanceMetrics(imageUrl: string, bandwidthSaved: number, req: Request) {
  try {
    const userAgent = req.headers.get('user-agent') || ''
    const referer = req.headers.get('referer') || ''
    
    await supabase
      .from('image_performance_metrics')
      .insert({
        image_url: imageUrl,
        page_url: referer,
        bandwidth_saved_bytes: bandwidthSaved,
        user_agent: userAgent,
        connection_type: 'unknown' // Could be enhanced with actual connection detection
      })
  } catch (error) {
    console.error('Failed to record performance metrics:', error)
  }
}
