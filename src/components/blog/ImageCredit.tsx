
import React from 'react';

interface ImageCreditProps {
  credit: string;
  className?: string;
}

const ImageCredit = ({ credit, className = '' }: ImageCreditProps) => {
  if (!credit) return null;

  return (
    <div 
      className={`text-xs text-muted-foreground mt-2 ${className}`}
      dangerouslySetInnerHTML={{ __html: credit }}
      style={{
        fontSize: '0.75rem',
        lineHeight: '1rem',
        opacity: 0.7
      }}
    />
  );
};

export default ImageCredit;
