import Anthropic from "npm:@anthropic-ai/sdk@^0.40.1";

export const CLAUDE_HAIKU = "claude-haiku-4-5";
export const CLAUDE_SONNET = "claude-sonnet-4-6";
export const CLAUDE_OPUS = "claude-opus-4-7";

export function getAnthropicClient(): Anthropic {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

export function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map(block => block.text)
    .join("");
}

export type { Anthropic };
