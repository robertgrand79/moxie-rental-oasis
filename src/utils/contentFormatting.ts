
/**
 * Converts plain text with \n\n paragraph breaks to proper HTML paragraphs with double spacing
 */
export function convertTextToHTMLParagraphs(text: string): string {
  if (!text || text.trim() === '') {
    return '';
  }

  // Split by double line breaks to get paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0);

  // Wrap each paragraph in <p> tags with double spacing (margin-bottom)
  const htmlParagraphs = paragraphs.map(paragraph => `<p style="margin-bottom: 2rem;">${paragraph}</p>`);

  return htmlParagraphs.join('\n');
}

/**
 * Checks if content is already in HTML format
 */
export function isHTMLContent(content: string): boolean {
  // Simple check for HTML tags
  return /<[^>]+>/.test(content);
}

/**
 * Safely converts content to HTML paragraphs only if it's plain text
 */
export function ensureHTMLParagraphs(content: string): string {
  if (isHTMLContent(content)) {
    return content; // Already HTML, return as-is
  }
  
  return convertTextToHTMLParagraphs(content);
}
