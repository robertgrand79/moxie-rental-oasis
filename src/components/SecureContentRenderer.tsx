
import React from 'react';
import { sanitizeHtml } from '@/utils/security';

interface SecureContentRendererProps {
  content: string;
  className?: string;
  allowedTags?: string[];
  maxLength?: number;
}

const SecureContentRenderer: React.FC<SecureContentRendererProps> = ({ 
  content, 
  className = '',
  maxLength = 10000
}) => {
  // Validate content length
  if (content.length > maxLength) {
    console.warn('Content exceeds maximum length, truncating...');
    content = content.substring(0, maxLength) + '...';
  }

  // Sanitize the content
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div 
      className={`overflow-hidden word-wrap break-words ${className}`}
      style={{ 
        maxWidth: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default SecureContentRenderer;
