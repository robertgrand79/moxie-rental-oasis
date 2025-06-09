
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PropertyDescriptionProps {
  description: string;
  isMobile: boolean;
}

const PropertyDescription = ({ description, isMobile }: PropertyDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Split description into sentences for better readability
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const firstSentence = sentences[0] + '.';
  const remainingSentences = sentences.slice(1).join('. ') + (sentences.length > 1 ? '.' : '');
  
  // Determine if we need "Read More" functionality
  const needsExpansion = description.length > 200;
  const showContent = isExpanded || !needsExpansion;
  
  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed text-base">
            {showContent ? description : firstSentence}
          </p>
        </div>
        
        {needsExpansion && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Read More
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed text-lg">
        {description}
      </p>
    </div>
  );
};

export default PropertyDescription;
