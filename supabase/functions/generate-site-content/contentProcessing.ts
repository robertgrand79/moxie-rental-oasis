
// Content processing utilities for cleaning and formatting generated content

export function enhanceParagraphStructure(content: string): string {
  return content
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold markdown
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic markdown
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove bullet points
    .replace(/^\s*[-*+]\s+/gm, '')
    // Remove numbered lists
    .replace(/^\s*\d+\.\s+/gm, '')
    // Ensure proper paragraph spacing - convert single line breaks to spaces within paragraphs
    .replace(/([.!?])\s*\n(?!\n)/g, '$1 ')
    // Ensure double line breaks between distinct paragraphs
    .replace(/\n\s*\n/g, '\n\n')
    // Clean up excessive whitespace but preserve paragraph breaks
    .replace(/\n{3,}/g, '\n\n')
    // Ensure sentences that should start new paragraphs do so
    .replace(/([.!?])\s+(Spring|Summer|Fall|Winter|Another|Additionally|Furthermore|However|Meanwhile|First|Second|Third|Finally|In conclusion|To conclude|Eugene|The|When|During|Whether)/g, '$1\n\n$2')
    .trim();
}

// Helper function to clean up any remaining markdown artifacts
export function cleanMarkdownArtifacts(content: string): string {
  return enhanceParagraphStructure(content);
}
