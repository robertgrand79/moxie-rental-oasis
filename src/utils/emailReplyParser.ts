/**
 * Parses email message content to separate new text from quoted reply text.
 */

const REPLY_PATTERNS = [
  // "On Mon, Jan 1, 2024 at 10:00 AM, John wrote:"
  /^On .+wrote:\s*$/im,
  // "--- Original Message ---" or "---Original Message---"
  /^-{2,}\s*Original Message\s*-{2,}/im,
  // "From: someone@example.com" (common in forwarded/replied emails)
  /^From:\s+.+@.+/im,
  // "> quoted text" lines (3+ consecutive)
  /(?:^>.*\n){3,}/m,
  // "On [date] [time]" without "wrote:" but with email-like context
  /^On \d{1,2}\/\d{1,2}\/\d{2,4}.*$/im,
  // "Sent from my iPhone" etc.
  /^Sent from my /im,
  // Gmail-style divider
  /^---------- Forwarded message ---------/im,
];

export interface ParsedEmailContent {
  newText: string;
  quotedText: string | null;
}

export function parseEmailReply(content: string | null | undefined): ParsedEmailContent {
  if (!content) {
    return { newText: '', quotedText: null };
  }

  for (const pattern of REPLY_PATTERNS) {
    const match = content.match(pattern);
    if (match && match.index !== undefined && match.index > 0) {
      const newText = content.slice(0, match.index).trimEnd();
      const quotedText = content.slice(match.index).trim();

      // Only split if newText has meaningful content
      if (newText.length > 10) {
        return { newText, quotedText };
      }
    }
  }

  return { newText: content, quotedText: null };
}
