export const convertHTMLToCraftJS = (html: string): string | undefined => {
  if (!html || html.trim() === '') {
    return undefined;
  }

  // Check if it's already CraftJS format
  try {
    const parsed = JSON.parse(html);
    if (parsed && typeof parsed === 'object' && parsed.ROOT) {
      return html;
    }
  } catch {
    // Not JSON, continue with HTML conversion
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html.trim();
  
  const nodes: Record<string, any> = {
    ROOT: {
      type: { resolvedName: 'Container' },
      isCanvas: true,
      props: { background: '#ffffff', padding: 20 },
      displayName: 'Container',
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {}
    }
  };

  let nodeCounter = 0;
  const rootNodes: string[] = [];

  // Function to process each child element
  const processElement = (element: Node): string | null => {
    if (element.nodeType === Node.TEXT_NODE) {
      const textContent = element.textContent?.trim();
      if (!textContent) return null;
      
      const nodeId = `text-${nodeCounter++}`;
      nodes[nodeId] = {
        type: { resolvedName: 'Text' },
        isCanvas: false,
        props: {
          text: textContent,
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
      };
      return nodeId;
    }

    if (element.nodeType === Node.ELEMENT_NODE) {
      const htmlElement = element as HTMLElement;
      const tagName = htmlElement.tagName.toLowerCase();
      const textContent = htmlElement.textContent?.trim() || '';
      
      if (!textContent) return null;

      const nodeId = `${tagName}-${nodeCounter++}`;

      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const level = parseInt(tagName.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6;
          nodes[nodeId] = {
            type: { resolvedName: 'Heading' },
            isCanvas: false,
            props: {
              text: textContent,
              level: level,
              color: '#000000',
              textAlign: 'left'
            },
            displayName: 'Heading',
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {},
            parent: 'ROOT'
          };
          break;

        case 'p':
          nodes[nodeId] = {
            type: { resolvedName: 'Text' },
            isCanvas: false,
            props: {
              text: textContent,
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
          };
          break;

        case 'hr':
          nodes[nodeId] = {
            type: { resolvedName: 'Divider' },
            isCanvas: false,
            props: {
              color: '#e2e8f0',
              thickness: 1,
              margin: 20
            },
            displayName: 'Divider',
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {},
            parent: 'ROOT'
          };
          break;

        case 'div':
          // Check if it looks like a card (has multiple child elements)
          const childElements = Array.from(htmlElement.children);
          if (childElements.length > 1) {
            const titleElement = childElements.find(child => 
              ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.tagName.toLowerCase())
            ) as HTMLElement | undefined;
            const title = titleElement?.textContent?.trim() || 'Card Title';
            const content = Array.from(htmlElement.childNodes)
              .filter(node => node !== titleElement)
              .map(node => node.textContent?.trim())
              .filter(Boolean)
              .join(' ') || 'Card content';

            nodes[nodeId] = {
              type: { resolvedName: 'Card' },
              isCanvas: false,
              props: {
                title: title,
                content: content,
                backgroundColor: '#ffffff',
                padding: 20
              },
              displayName: 'Card',
              custom: {},
              hidden: false,
              nodes: [],
              linkedNodes: {},
              parent: 'ROOT'
            };
          } else {
            // Treat as regular text
            nodes[nodeId] = {
              type: { resolvedName: 'Text' },
              isCanvas: false,
              props: {
                text: textContent,
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
            };
          }
          break;

        default:
          // Default to text for unrecognized elements
          nodes[nodeId] = {
            type: { resolvedName: 'Text' },
            isCanvas: false,
            props: {
              text: textContent,
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
          };
      }

      return nodeId;
    }

    return null;
  };

  // Process all child nodes
  Array.from(tempDiv.childNodes).forEach(child => {
    const nodeId = processElement(child);
    if (nodeId) {
      rootNodes.push(nodeId);
    }
  });

  // If no nodes were created, create a default text node
  if (rootNodes.length === 0) {
    const nodeId = `text-${nodeCounter++}`;
    nodes[nodeId] = {
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
    };
    rootNodes.push(nodeId);
  }

  nodes.ROOT.nodes = rootNodes;

  return JSON.stringify(nodes);
};

export const extractTextFromHTML = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

export const convertCraftJSToHTML = (craftJSData: string): string => {
  if (!craftJSData) return '';

  try {
    const parsed = JSON.parse(craftJSData);
    if (!parsed || !parsed.ROOT) return craftJSData;

    let html = '';

    const processNode = (nodeId: string): string => {
      const node = parsed[nodeId];
      if (!node) return '';

      const { type, props } = node;
      const resolvedName = type?.resolvedName;

      switch (resolvedName) {
        case 'Text':
          return `<p style="color: ${props.color}; text-align: ${props.textAlign}; font-size: ${props.fontSize}px;">${props.text || ''}</p>`;
        
        case 'Heading':
          return `<h${props.level} style="color: ${props.color}; text-align: ${props.textAlign};">${props.text || ''}</h${props.level}>`;
        
        case 'Card':
          return `
            <div style="background-color: ${props.backgroundColor}; padding: ${props.padding}px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 10px 0;">
              ${props.title ? `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">${props.title}</h3>` : ''}
              ${props.content ? `<p style="color: #6b7280;">${props.content}</p>` : ''}
            </div>
          `;
        
        case 'Divider':
          return `<hr style="border-color: ${props.color}; border-width: ${props.thickness}px 0 0 0; margin: ${props.margin}px 0;" />`;
        
        case 'BuilderButton':
          return `<button style="background-color: ${props.backgroundColor}; color: ${props.textColor}; padding: 12px 24px; border-radius: 6px; border: none; margin: 5px 0;">${props.text || 'Button'}</button>`;
        
        case 'Container':
          const childrenHTML = node.nodes?.map((childId: string) => processNode(childId)).join('') || '';
          return `<div style="background: ${props.background}; padding: ${props.padding}px;">${childrenHTML}</div>`;
        
        default:
          return '';
      }
    };

    // Process all nodes starting from ROOT
    if (parsed.ROOT.nodes) {
      html = parsed.ROOT.nodes.map((nodeId: string) => processNode(nodeId)).join('');
    }

    return html || craftJSData;
  } catch (error) {
    console.error('Error converting CraftJS to HTML:', error);
    return craftJSData;
  }
};
