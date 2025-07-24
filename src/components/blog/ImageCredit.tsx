
import React from 'react';
import SecureContentRenderer from '@/components/SecureContentRenderer';

interface ImageCreditProps {
  credit: string;
  className?: string;
}

const ImageCredit = ({ credit, className = '' }: ImageCreditProps) => {
  if (!credit) return null;
  
  return (
    <SecureContentRenderer
      content={credit}
      className={`text-xs text-muted-foreground mt-2 ${className}`}
      maxLength={500}
    />
  );
};

export default ImageCredit;
