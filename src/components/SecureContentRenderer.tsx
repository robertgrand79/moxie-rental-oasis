
import React from 'react';
import { sanitizeHtml, sanitizeNewsletterHtml } from '@/utils/security';
import { useAuth } from '@/contexts/AuthContext';

interface SecureContentRendererProps {
  content: string;
  className?: string;
  allowedTags?: string[];
  maxLength?: number;
  // Use the newsletter-friendly allow-list (tables, divs, inline styles, hr,
  // span). Required for previewing TipTap newsletter output — the default
  // strict allow-list strips the layout elements and produces an empty render.
  richContent?: boolean;
}

const SecureContentRenderer: React.FC<SecureContentRendererProps> = ({
  content,
  className = '',
  maxLength = 10000,
  richContent = false,
}) => {
  const { user } = useAuth();

  // Validate content length. Newsletters can legitimately be large, so give them
  // 50× headroom; everything else stays at the original 10k guard.
  const effectiveMax = richContent ? maxLength * 50 : maxLength;
  if (content.length > effectiveMax) {
    console.warn('Content exceeds maximum length, truncating...');
    content = content.substring(0, effectiveMax) + '...';
  }

  const sanitizedContent = richContent
    ? sanitizeNewsletterHtml(content, user?.id)
    : sanitizeHtml(content, user?.id);

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
