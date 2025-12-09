import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, vibe, imageBase64 } = await req.json();
    console.log("Generating palette for type:", type, "vibe:", vibe);

    let prompt = "";
    const messages: any[] = [];

    if (type === "vibe") {
      const vibeDescriptions: Record<string, string> = {
        "Beachy": "coastal, ocean blues, sandy beiges, seafoam greens, coral accents, bright and airy",
        "Mountain Lodge": "earthy browns, forest greens, warm wood tones, stone grays, cozy and rustic",
        "Modern Luxury": "sleek neutrals, black and white contrasts, gold or brass accents, minimalist elegance",
        "Rustic Cabin": "warm browns, burnt oranges, deep reds, cream, natural wood tones, cozy and inviting",
        "Desert Retreat": "terracotta, sage green, warm sand, burnt sienna, dusty rose, southwestern warmth",
        "Urban Chic": "industrial grays, exposed brick reds, matte black, copper accents, contemporary edge",
        "Tropical Paradise": "vibrant greens, hot pink, turquoise, sunny yellow, lush and energetic",
        "Cozy Cottage": "soft pastels, cream, lavender, sage, warm whites, romantic and comfortable"
      };

      const description = vibeDescriptions[vibe] || vibe;
      prompt = `Generate a professional 6-color palette for a vacation rental website with a "${vibe}" aesthetic (${description}). 
      
Return exactly 6 hex colors in this order:
1. Primary - main brand color
2. Secondary - complementary color
3. Accent - pop of color for CTAs and highlights
4. Background - light background color (should be light/white-ish)
5. Text - dark text color (should be dark/readable)
6. Muted - subtle background/border color

The colors should work harmoniously together and be suitable for a professional vacation rental website.`;

      messages.push({
        role: "system",
        content: "You are a professional color palette designer. Return color palettes as JSON only, no explanations."
      });
      messages.push({ role: "user", content: prompt });

    } else if (type === "photo" && imageBase64) {
      messages.push({
        role: "system", 
        content: "You are a professional color palette designer. Analyze images and extract dominant colors to create cohesive palettes. Return only JSON, no explanations."
      });
      messages.push({
        role: "user",
        content: [
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

The colors should work for a professional vacation rental website.`
          },
          {
            type: "image_url",
            image_url: { url: imageBase64 }
          }
        ]
      });
    } else {
      throw new Error("Invalid request: specify type as 'vibe' or 'photo'");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "return_color_palette",
              description: "Return a 6-color palette with hex values",
              parameters: {
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
                      muted: { type: "string", description: "Muted color hex" }
                    },
                    required: ["primary", "secondary", "accent", "background", "text", "muted"]
                  },
                  name: { type: "string", description: "A creative name for this palette" }
                },
                required: ["palette", "name"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_color_palette" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No palette generated");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Generated palette:", result);

    return new Response(JSON.stringify(result), {
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
