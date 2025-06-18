
export const convertHTMLToCraftJS = (html: string): string | undefined => {
  // This is a basic converter - it could be enhanced further
  // For now, we'll handle simple cases and let CraftJS handle the rest
  
  if (!html || html.trim() === '') {
    return undefined;
  }

  // If it's already CraftJS data, return it
  try {
    const parsed = JSON.parse(html);
    if (parsed && typeof parsed === 'object' && parsed.ROOT) {
      return html;
    }
  } catch {
    // Not JSON, continue with HTML conversion
  }

  // Basic HTML to CraftJS conversion
  // This creates a simple structure that CraftJS can work with
  const basicStructure = {
    ROOT: {
      type: { resolvedName: 'Container' },
      isCanvas: true,
      props: { background: '#ffffff', padding: 20 },
      displayName: 'Container',
      custom: {},
      hidden: false,
      nodes: ['text-node'],
      linkedNodes: {}
    },
    'text-node': {
      type: { resolvedName: 'Text' },
      isCanvas: false,
      props: { 
        text: html,
        fontSize: 16,
        textAlign: 'left',
        color: '#000000'
      },
      displayName: 'Text',
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: 'ROOT'
    }
  };

  return JSON.stringify(basicStructure);
};

export const extractTextFromHTML = (html: string): string => {
  // Create a temporary div to extract text content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};
