import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Increased max file size to 20MB since Firecrawl handles heavy lifting
const MAX_FILE_SIZE = 20 * 1024 * 1024;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, filePath } = await req.json();

    console.log('Parsing document:', { documentId, filePath });

    if (!documentId || !filePath) {
      return new Response(JSON.stringify({ error: 'documentId and filePath are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('property-documents')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('Could not get public URL for file');
      return new Response(JSON.stringify({ error: 'Failed to get document URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const publicUrl = urlData.publicUrl;
    console.log('Document public URL:', publicUrl);

    // Get file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    let extractedText = '';

    // For PDFs and image-based documents, use Firecrawl for OCR-capable extraction
    if (extension === 'pdf') {
      console.log('Using Firecrawl for PDF extraction with OCR support');
      extractedText = await extractWithFirecrawl(publicUrl);
    } else if (extension === 'txt' || extension === 'md') {
      // Plain text files - download and read directly
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('property-documents')
        .download(filePath);

      if (downloadError) {
        console.error('Error downloading file:', downloadError);
        extractedText = '[Failed to download document]';
      } else {
        extractedText = await fileData.text();
      }
    } else if (extension === 'docx') {
      // For DOCX, try Firecrawl first, then fallback
      console.log('Using Firecrawl for DOCX extraction');
      extractedText = await extractWithFirecrawl(publicUrl);
    } else {
      // For other formats, try Firecrawl
      console.log('Attempting Firecrawl extraction for:', extension);
      extractedText = await extractWithFirecrawl(publicUrl);
    }

    // Clean up extracted text
    extractedText = cleanText(extractedText);

    console.log('Extracted text length:', extractedText.length);
    console.log('Text preview:', extractedText.substring(0, 500));

    // Update the document record with extracted text
    const { error: updateError } = await supabase
      .from('property_documents')
      .update({ extracted_text: extractedText })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to save extracted text' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      extractedLength: extractedText.length,
      preview: extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : '')
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-property-document function:', error);
    return new Response(JSON.stringify({ error: 'Failed to parse document' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Extract text using Firecrawl API (supports OCR for image-based PDFs)
async function extractWithFirecrawl(documentUrl: string): Promise<string> {
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  if (!firecrawlApiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return '[Document extraction unavailable - Firecrawl API not configured]';
  }

  // Retry logic for handling timeouts
  const maxRetries = 2;
  let lastError = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Calling Firecrawl API (attempt ${attempt}/${maxRetries}) for document:`, documentUrl);
      
      // Use AbortController for timeout (90 seconds to allow for large PDFs)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: documentUrl,
          formats: ['markdown'],
          onlyMainContent: false,
          waitFor: 10000, // Wait 10s for content to load (increased from 5s)
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Firecrawl API error:', response.status, errorData);
        lastError = `API error: ${response.status}`;
        
        // If it's a timeout (408), retry
        if (response.status === 408 && attempt < maxRetries) {
          console.log('Timeout error, retrying...');
          continue;
        }
        
        return `[Document extraction failed - ${lastError}]`;
      }

      const data = await response.json();
      console.log('Firecrawl response success:', data.success);
      
      // Access the markdown content - Firecrawl v1 nests content in data
      const markdown = data.data?.markdown || data.markdown || '';
      
      if (!markdown || markdown.length < 50) {
        console.log('Firecrawl returned minimal content, raw response:', JSON.stringify(data).substring(0, 500));
        return '[Document extraction returned minimal content. The document may be image-based or protected.]';
      }

      console.log('Firecrawl extracted', markdown.length, 'characters');
      return markdown;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Request timed out on attempt ${attempt}`);
        lastError = 'Request timed out';
        if (attempt < maxRetries) continue;
      } else {
        console.error('Firecrawl extraction error:', error);
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  }
  
  return `[Document extraction failed after ${maxRetries} attempts: ${lastError}]`;
}

// Clean and limit text
function cleanText(text: string): string {
  if (!text) return '';
  
  // Limit to 50k chars to stay within reasonable bounds
  const limited = text.substring(0, 50000);
  
  return limited
    .replace(/\s+/g, ' ')
    .trim();
}
