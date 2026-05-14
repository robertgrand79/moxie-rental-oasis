import Anthropic from "npm:@anthropic-ai/sdk@^0.40.1";
import { CLAUDE_HAIKU, getAnthropicClient, extractText } from "../_shared/anthropicClient.ts";

export async function generateContentWithAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 500
): Promise<string> {
  const client = getAnthropicClient();

  try {
    const response = await client.messages.create({
      model: CLAUDE_HAIKU,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    return extractText(response);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (error instanceof Anthropic.AuthenticationError) {
      throw new Error("AI credentials invalid. Please contact support.");
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API error:", error.status, error.message);
      throw new Error(`AI service error (${error.status}): ${error.message}`);
    }
    throw error;
  }
}

export function getMaxTokensForCategory(category: string): number {
  switch (category) {
    case 'newsletter':
      return 2000;
    case 'pages':
      return 1500;
    case 'blog':
      return 2000;
    case 'settings':
      return 300;
    default:
      return 500;
  }
}
