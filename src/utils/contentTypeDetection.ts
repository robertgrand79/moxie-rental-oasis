
export type ContentType = 'html' | 'craftjs' | 'markdown' | 'empty';

export const detectContentType = (content: string): ContentType => {
  if (!content || content.trim() === '') {
    return 'empty';
  }

  // Check if it's CraftJS format (JSON with ROOT node)
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && parsed.ROOT) {
      return 'craftjs';
    }
  } catch {
    // Not JSON, continue checking
  }

  // Check if it contains HTML tags
  const htmlTagRegex = /<[^>]+>/;
  if (htmlTagRegex.test(content)) {
    return 'html';
  }

  // Check for markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s/m, // Headers
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /\[.*\]\(.*\)/, // Links
  ];
  
  if (markdownPatterns.some(pattern => pattern.test(content))) {
    return 'markdown';
  }

  // Default to HTML for other text content
  return 'html';
};

export const shouldUseRichTextEditor = (contentType: ContentType): boolean => {
  return contentType === 'html' || contentType === 'markdown' || contentType === 'empty';
};

export const shouldUseVisualBuilder = (contentType: ContentType): boolean => {
  return contentType === 'craftjs';
};
