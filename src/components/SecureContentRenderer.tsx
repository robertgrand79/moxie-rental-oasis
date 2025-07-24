
import React from 'react';
import { sanitizeHtml } from '@/utils/security';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  // Validate content length
  if (content.length > maxLength) {
    console.warn('Content exceeds maximum length, truncating...');
    content = content.substring(0, maxLength) + '...';
  }

  // Sanitize the content with user context for logging
  const sanitizedContent = sanitizeHtml(content, user?.id);

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
