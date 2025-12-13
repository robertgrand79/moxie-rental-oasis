import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('property-documents')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return new Response(JSON.stringify({ error: 'Failed to download document' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    let extractedText = '';

    if (extension === 'txt' || extension === 'md') {
      // Plain text files
      extractedText = await fileData.text();
    } else if (extension === 'pdf') {
      // For PDF, we'll use a simple text extraction approach
      // In production, you might want to use a more robust PDF parser
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Simple PDF text extraction (basic approach)
      // This extracts visible text from PDF but won't handle complex layouts
      extractedText = extractTextFromPDF(bytes);
      
      if (!extractedText || extractedText.length < 50) {
        // If extraction failed or got minimal text, note this
        extractedText = '[PDF document uploaded - text extraction limited. Manual content entry recommended for best AI assistance.]';
      }
    } else if (extension === 'docx') {
      // For DOCX, extract text from XML structure
      const arrayBuffer = await fileData.arrayBuffer();
      extractedText = await extractTextFromDocx(arrayBuffer);
    } else {
      // For other formats, try as text
      try {
        extractedText = await fileData.text();
      } catch {
        extractedText = `[Document uploaded: ${filePath}. Format not fully supported for text extraction.]`;
      }
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .trim()
      .substring(0, 50000); // Limit to 50k chars for AI context

    console.log('Extracted text length:', extractedText.length);

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

// Simple PDF text extraction
function extractTextFromPDF(bytes: Uint8Array): string {
  const text: string[] = [];
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const content = decoder.decode(bytes);
  
  // Look for text streams in PDF
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  let match;
  
  while ((match = streamRegex.exec(content)) !== null) {
    const stream = match[1];
    // Extract text operators (Tj, TJ, ')
    const textRegex = /\(([^)]*)\)\s*Tj|\[([^\]]*)\]\s*TJ|'([^']*)/g;
    let textMatch;
    
    while ((textMatch = textRegex.exec(stream)) !== null) {
      const extracted = textMatch[1] || textMatch[2] || textMatch[3];
      if (extracted) {
        // Clean up the text
        const cleaned = extracted
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\t/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
        text.push(cleaned);
      }
    }
  }
  
  // Also try to extract plain text that might be in the PDF
  const plainTextRegex = /BT\s*([\s\S]*?)\s*ET/g;
  while ((match = plainTextRegex.exec(content)) !== null) {
    const block = match[1];
    const textOpRegex = /\(([^)]+)\)/g;
    let textMatch;
    while ((textMatch = textOpRegex.exec(block)) !== null) {
      if (textMatch[1] && textMatch[1].length > 1) {
        text.push(textMatch[1]);
      }
    }
  }
  
  return text.join(' ').replace(/\s+/g, ' ').trim();
}

// Simple DOCX text extraction
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // DOCX is a ZIP file containing XML
    // We'll look for the document.xml content
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(bytes);
    
    // Extract text between <w:t> tags (Word text elements)
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    const texts: string[] = [];
    let match;
    
    while ((match = textRegex.exec(content)) !== null) {
      if (match[1]) {
        texts.push(match[1]);
      }
    }
    
    return texts.join(' ').replace(/\s+/g, ' ').trim();
  } catch {
    return '[DOCX extraction failed. Manual content entry recommended.]';
  }
}
