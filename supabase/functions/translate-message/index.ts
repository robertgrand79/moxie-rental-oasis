import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk@^0.40.1";
import { CLAUDE_HAIKU, getAnthropicClient, extractText } from "../_shared/anthropicClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  detectOnly?: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
  nl: 'Dutch',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  fi: 'Finnish',
  pl: 'Polish',
  tr: 'Turkish',
  th: 'Thai',
  vi: 'Vietnamese',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      text, 
      targetLanguage, 
      sourceLanguage,
      detectOnly = false
    }: TranslateRequest = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Deno.env.get("ANTHROPIC_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (detectOnly) {
      // Language detection only
      systemPrompt = `You are a language detection expert. Analyze text and identify the language.
      
Return ONLY a JSON object with this exact format:
{
  "languageCode": "xx",
  "languageName": "Language Name",
  "confidence": 0.95
}

Use ISO 639-1 two-letter language codes (en, es, fr, de, etc.)
Confidence should be between 0 and 1.`;

      userPrompt = `Detect the language of this text:\n\n${text}`;
    } else {
      // Translation
      const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
      const sourceLangName = sourceLanguage ? (LANGUAGE_NAMES[sourceLanguage] || sourceLanguage) : null;

      systemPrompt = `You are a professional translator specializing in hospitality and vacation rental communications.

Rules:
- Translate naturally, not literally
- Preserve the tone and intent of the original message
- Keep any template variables like {{guest_name}} unchanged
- Maintain formatting and paragraph breaks
- Be culturally appropriate for the target language

Return ONLY a JSON object with this exact format:
{
  "translatedText": "the translated text here",
  "detectedSourceLanguage": "xx",
  "detectedSourceLanguageName": "Language Name"
}`;

      userPrompt = sourceLangName 
        ? `Translate this text from ${sourceLangName} to ${targetLangName}:\n\n${text}`
        : `Translate this text to ${targetLangName}:\n\n${text}`;
    }

    console.log(`${detectOnly ? 'Detecting language' : `Translating to ${targetLanguage}`}...`);

    const anthropic = getAnthropicClient();
    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create({
        model: CLAUDE_HAIKU,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (error instanceof Anthropic.APIError) {
        console.error("Anthropic API error:", error.status, error.message);
        return new Response(
          JSON.stringify({ error: `AI request failed (${error.status}): ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    const content = extractText(response);

    // Parse JSON from response
    let result: any;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      
      if (detectOnly) {
        // Fallback for detection
        result = {
          languageCode: 'en',
          languageName: 'English (fallback)',
          confidence: 0.5
        };
      } else {
        // Fallback for translation - return original
        result = {
          translatedText: text,
          detectedSourceLanguage: 'unknown',
          detectedSourceLanguageName: 'Unknown'
        };
      }
    }

    console.log(detectOnly ? "Language detected" : "Translation completed");

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in translate-message:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
