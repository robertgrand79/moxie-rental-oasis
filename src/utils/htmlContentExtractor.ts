export interface ContentExtractionResult {
  content: string;
  wasFullDocument: boolean;
  extractedStyles?: string;
}

export const extractContentFromHTML = (htmlString: string): ContentExtractionResult => {
  if (!htmlString || htmlString.trim() === '') {
    return { content: '', wasFullDocument: false };
  }

  // Check if this is a full HTML document
  const isFullDocument = htmlString.includes('<!DOCTYPE') || 
                         htmlString.includes('<html') || 
                         htmlString.includes('<head>');

  if (!isFullDocument) {
    // It's already just content, return as-is
    return { content: htmlString, wasFullDocument: false };
  }

  try {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Extract styles from head if present
    const styleElements = doc.querySelectorAll('style');
    let extractedStyles = '';
    styleElements.forEach(style => {
      extractedStyles += style.textContent || '';
    });

    // Get content from body, or fall back to the entire content if no body
    const bodyElement = doc.querySelector('body');
    let content = '';

    if (bodyElement) {
      content = bodyElement.innerHTML;
    } else {
      // If no body found, try to extract content between body tags using regex
      const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = bodyMatch[1];
      } else {
        // Last resort: remove DOCTYPE, html, head tags but keep the rest
        content = htmlString
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<\/?html[^>]*>/gi, '')
          .replace(/<head[\s\S]*?<\/head>/gi, '')
          .replace(/<\/?body[^>]*>/gi, '')
          .trim();
      }
    }

    return {
      content: content.trim(),
      wasFullDocument: true,
      extractedStyles: extractedStyles || undefined
    };
  } catch (error) {
    console.warn('Error parsing HTML document, returning original content:', error);
    return { content: htmlString, wasFullDocument: true };
  }
};

export const isFullHTMLDocument = (htmlString: string): boolean => {
  return htmlString.includes('<!DOCTYPE') || 
         htmlString.includes('<html') || 
         htmlString.includes('<head>');
};
