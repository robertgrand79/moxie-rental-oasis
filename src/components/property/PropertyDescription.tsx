
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, Star, Coffee } from 'lucide-react';

interface PropertyDescriptionProps {
  description: string;
  isMobile: boolean;
}

const PropertyDescription = ({ description, isMobile }: PropertyDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Smart content parsing - split by common patterns
  const parseDescription = (text: string) => {
    // Look for natural section breaks (periods followed by capital letters, or common section starters)
    const sections = text.split(/(?<=\.)\s*(?=[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*[:\.])|(?<=\.)\s*(?=Located|Featuring|The|This|Our|With|Each|Perfect)/);
    
    if (sections.length <= 1) {
      // If no natural sections found, create chunks by sentence count
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const chunks = [];
      for (let i = 0; i < sentences.length; i += 2) {
        chunks.push(sentences.slice(i, i + 2).join('. ') + '.');
      }
      return chunks;
    }
    
    return sections.filter(s => s.trim().length > 0);
  };

  const sections = parseDescription(description);
  const firstSection = sections[0]?.trim() || description;
  const remainingSections = sections.slice(1);
  
  // Extract key highlights from the text
  const extractHighlights = (text: string) => {
    const highlights = [];
    if (text.toLowerCase().includes('downtown') || text.toLowerCase().includes('city center')) {
      highlights.push({ icon: MapPin, text: 'Prime Downtown Location', color: 'text-blue-600' });
    }
    if (text.toLowerCase().includes('luxury') || text.toLowerCase().includes('premium')) {
      highlights.push({ icon: Star, text: 'Luxury Experience', color: 'text-amber-600' });
    }
    if (text.toLowerCase().includes('coffee') || text.toLowerCase().includes('dining')) {
      highlights.push({ icon: Coffee, text: 'Great Local Dining', color: 'text-green-600' });
    }
    return highlights;
  };

  const highlights = extractHighlights(description);
  const needsExpansion = sections.length > 1 || description.length > 300;

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Key Highlights */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-center bg-gray-50 rounded-full px-3 py-1.5 text-xs">
                <highlight.icon className={`h-3 w-3 mr-1.5 ${highlight.color}`} />
                <span className="font-medium text-gray-700">{highlight.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Description */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed mb-0">
              {firstSection}
            </p>
            
            {isExpanded && remainingSections.length > 0 && (
              <div className="mt-4 space-y-3">
                {remainingSections.map((section, index) => (
                  <div key={index} className="pl-4 border-l-2 border-primary/20">
                    <p className="text-gray-600 leading-relaxed mb-0 text-sm">
                      {section.trim()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {needsExpansion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-primary hover:text-primary/80 p-0 h-auto font-medium"
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Highlights */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-center bg-gradient-to-r from-gray-50 to-white rounded-lg px-4 py-2 border border-gray-100 shadow-sm">
              <highlight.icon className={`h-4 w-4 mr-2 ${highlight.color}`} />
              <span className="font-semibold text-gray-700">{highlight.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Description Layout */}
      <div className="grid gap-6">
        {/* Primary Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg font-medium mb-0">
              {firstSection}
            </p>
          </div>
        </div>

        {/* Additional Sections */}
        {remainingSections.length > 0 && (
          <div className="space-y-4">
            {remainingSections.map((section, index) => (
              <div key={index} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></div>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-0">
                      {section.trim()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDescription;
