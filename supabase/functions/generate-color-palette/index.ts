import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk@^0.40.1";
import { CLAUDE_HAIKU, getAnthropicClient } from "../_shared/anthropicClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PALETTE_TOOL: Anthropic.Tool = {
  name: "return_color_palette",
  description: "Return a 6-color palette with hex values",
  input_schema: {
    type: "object",
    properties: {
      palette: {
        type: "object",
        properties: {
          primary: { type: "string", description: "Primary color hex (e.g. #0077be)" },
          secondary: { type: "string", description: "Secondary color hex" },
          accent: { type: "string", description: "Accent color hex" },
          background: { type: "string", description: "Background color hex (light)" },
          text: { type: "string", description: "Text color hex (dark)" },
          muted: { type: "string", description: "Muted color hex" },
        },
        required: ["primary", "secondary", "accent", "background", "text", "muted"],
      },
      name: { type: "string", description: "A creative name for this palette" },
    },
    required: ["palette", "name"],
  },
};

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function parseImageDataUrl(input: string): { mediaType: ImageMediaType; data: string } {
  const match = input.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
  if (match) {
    return { mediaType: match[1] as ImageMediaType, data: match[2] };
  }
  return { mediaType: "image/jpeg", data: input };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!Deno.env.get("ANTHROPIC_API_KEY")) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const { type, vibe, imageBase64 } = await req.json();
    console.log("Generating palette for type:", type, "vibe:", vibe);

    let systemPrompt = "";
    let userContent: Anthropic.MessageParam["content"];

    if (type === "vibe") {
      const vibeDescriptions: Record<string, string> = {
        "Beachy": "coastal, ocean blues, sandy beiges, seafoam greens, coral accents, bright and airy",
        "Mountain Lodge": "earthy browns, forest greens, warm wood tones, stone grays, cozy and rustic",
        "Modern Luxury": "sleek neutrals, black and white contrasts, gold or brass accents, minimalist elegance",
        "Rustic Cabin": "warm browns, burnt oranges, deep reds, cream, natural wood tones, cozy and inviting",
        "Desert Retreat": "terracotta, sage green, warm sand, burnt sienna, dusty rose, southwestern warmth",
        "Urban Chic": "industrial grays, exposed brick reds, matte black, copper accents, contemporary edge",
        "Tropical Paradise": "vibrant greens, hot pink, turquoise, sunny yellow, lush and energetic",
        "Cozy Cottage": "soft pastels, cream, lavender, sage, warm whites, romantic and comfortable",
      };

      const description = vibeDescriptions[vibe] || vibe;
      systemPrompt = "You are a professional color palette designer. Always return palettes via the return_color_palette tool.";
      userContent = `Generate a professional 6-color palette for a vacation rental website with a "${vibe}" aesthetic (${description}).

Return exactly 6 hex colors in this order:
1. Primary - main brand color
2. Secondary - complementary color
3. Accent - pop of color for CTAs and highlights
4. Background - light background color (should be light/white-ish)
5. Text - dark text color (should be dark/readable)
6. Muted - subtle background/border color

The colors should work harmoniously together and be suitable for a professional vacation rental website.`;
    } else if (type === "photo" && imageBase64) {
      const { mediaType, data } = parseImageDataUrl(imageBase64);
      systemPrompt = "You are a professional color palette designer. Analyze images and extract dominant colors to create cohesive palettes. Always return palettes via the return_color_palette tool.";
      userContent = [
        {
          type: "image",
          source: { type: "base64", media_type: mediaType, data },
        },
        {
          type: "text",
          text: `Analyze this property image and extract a 6-color palette that captures its essence.

Return exactly 6 hex colors in this order:
1. Primary - dominant/main color from the image
2. Secondary - second most prominent color
3. Accent - a vibrant accent color from the image
4. Background - a light neutral inspired by the image (should be light/white-ish for web backgrounds)
5. Text - a dark color for readable text (should be dark)
6. Muted - a subtle muted color from the image for borders/backgrounds

The colors should work for a professional vacation rental website.`,
        },
      ];
    } else {
      throw new Error("Invalid request: specify type as 'vibe' or 'photo'");
    }

    const anthropic = getAnthropicClient();

    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create({
        model: CLAUDE_HAIKU,
        max_tokens: 1024,
        system: systemPrompt,
        tools: [PALETTE_TOOL],
        tool_choice: { type: "tool", name: "return_color_palette" },
        messages: [{ role: "user", content: userContent }],
      });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (error instanceof Anthropic.APIError) {
        console.error("Anthropic API error:", error.status, error.message);
        throw new Error(`AI service error (${error.status}): ${error.message}`);
      }
      throw error;
    }

    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUseBlock) {
      console.error("No tool_use block in response:", JSON.stringify(response.content));
      throw new Error("No palette generated");
    }

    console.log("Generated palette:", toolUseBlock.input);
    return new Response(JSON.stringify(toolUseBlock.input), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating palette:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
