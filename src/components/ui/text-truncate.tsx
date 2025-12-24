import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface TextTruncateProps {
  text: string;
  maxLength?: number;
  className?: string;
  showTooltip?: boolean;
  lines?: number;
}

/**
 * Component for truncating long text with optional tooltip
 */
const TextTruncate: React.FC<TextTruncateProps> = ({
  text,
  maxLength = 50,
  className,
  showTooltip = true,
  lines,
}) => {
  const shouldTruncate = text.length > maxLength;
  const truncatedText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  // Line-based truncation
  if (lines) {
    const content = (
      <span
        className={cn(
          'block overflow-hidden',
          lines === 1 && 'truncate',
          lines > 1 && `line-clamp-${lines}`,
          className
        )}
        style={lines > 1 ? { 
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        } : undefined}
      >
        {text}
      </span>
    );

    if (showTooltip && text.length > maxLength) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="break-words">{text}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  }

  // Character-based truncation
  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  if (!showTooltip) {
    return <span className={className}>{truncatedText}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('cursor-help', className)}>{truncatedText}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TextTruncate;

/**
 * Utility function to safely truncate text
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Utility function to sanitize text by removing dangerous characters
 */
export const sanitizeDisplayText = (text: string): string => {
  if (!text) return '';
  // Remove script tags and javascript: URLs
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};
