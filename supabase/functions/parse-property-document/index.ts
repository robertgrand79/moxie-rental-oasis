import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Max file size: 5MB to prevent memory issues
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

    // Check file size
    const fileSize = fileData.size;
    console.log('File size:', fileSize);

    if (fileSize > MAX_FILE_SIZE) {
      console.log('File too large, skipping extraction');
      const extractedText = '[Document is too large for automatic text extraction. Please add a summary manually for AI assistance.]';
      
      await supabase
        .from('property_documents')
        .update({ extracted_text: extractedText })
        .eq('id', documentId);

      return new Response(JSON.stringify({ 
        success: true, 
        extractedLength: extractedText.length,
        preview: extractedText,
        warning: 'File too large for extraction'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    let extractedText = '';

    if (extension === 'txt' || extension === 'md') {
      // Plain text files - simple and memory efficient
      extractedText = await fileData.text();
    } else if (extension === 'pdf') {
      // For PDF, do simple text extraction with memory limits
      extractedText = await extractTextFromPDFSafe(fileData);
    } else if (extension === 'docx') {
      // For DOCX, extract text from XML structure
      extractedText = await extractTextFromDocxSafe(fileData);
    } else {
      // For other formats, try as text
      try {
        extractedText = await fileData.text();
      } catch {
        extractedText = `[Document uploaded: ${filePath}. Format not fully supported for text extraction.]`;
      }
    }

    // Clean up extracted text - limit processing
    extractedText = cleanText(extractedText);

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

// Clean and limit text to prevent memory issues
function cleanText(text: string): string {
  if (!text) return '';
  
  // Limit to first 30k chars before processing to save memory
  const limited = text.substring(0, 30000);
  
  return limited
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .trim();
}

// Memory-safe PDF text extraction
async function extractTextFromPDFSafe(fileData: Blob): Promise<string> {
  try {
    const text = await fileData.text();
    
    // Simple extraction - look for readable text patterns
    // Limit the amount we process
    const limitedContent = text.substring(0, 500000);
    
    const textParts: string[] = [];
    
    // Extract text from parentheses (common PDF text format)
    // Use a simple approach that doesn't consume too much memory
    let i = 0;
    let inParens = false;
    let current = '';
    
    while (i < limitedContent.length && textParts.length < 1000) {
      const char = limitedContent[i];
      
      if (char === '(' && !inParens) {
        inParens = true;
        current = '';
      } else if (char === ')' && inParens) {
        inParens = false;
        if (current.length > 2 && current.length < 500) {
          // Filter out binary-looking content
          const cleaned = current.replace(/\\[nrt]/g, ' ').replace(/\\/g, '');
          if (/^[\x20-\x7E\s]+$/.test(cleaned)) {
            textParts.push(cleaned);
          }
        }
      } else if (inParens && current.length < 500) {
        current += char;
      }
      i++;
    }
    
    const result = textParts.join(' ');
    
    if (result.length < 50) {
      return '[PDF document uploaded - text extraction limited. Please add a summary manually for AI assistance.]';
    }
    
    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '[PDF extraction failed. Please add a summary manually for AI assistance.]';
  }
}

// Memory-safe DOCX text extraction
async function extractTextFromDocxSafe(fileData: Blob): Promise<string> {
  try {
    const text = await fileData.text();
    
    // Limit content to process
    const limitedContent = text.substring(0, 500000);
    
    const textParts: string[] = [];
    
    // Simple XML text extraction without regex
    // Look for <w:t>...</w:t> patterns
    let i = 0;
    while (i < limitedContent.length && textParts.length < 2000) {
      const wtStart = limitedContent.indexOf('<w:t', i);
      if (wtStart === -1) break;
      
      const tagEnd = limitedContent.indexOf('>', wtStart);
      if (tagEnd === -1) break;
      
      const closeTag = limitedContent.indexOf('</w:t>', tagEnd);
      if (closeTag === -1) break;
      
      const content = limitedContent.substring(tagEnd + 1, closeTag);
      if (content && content.length < 1000) {
        textParts.push(content);
      }
      
      i = closeTag + 6;
    }
    
    const result = textParts.join(' ');
    
    if (result.length < 20) {
      return '[DOCX extraction limited. Please add a summary manually for AI assistance.]';
    }
    
    return result;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return '[DOCX extraction failed. Please add a summary manually for AI assistance.]';
  }
}
