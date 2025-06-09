
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, Star, Coffee, Car, Wifi, Users, Heart, Shield, TreePine, Utensils } from 'lucide-react';

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
  
  // Enhanced feature highlights extraction
  const extractHighlights = (text: string) => {
    const highlights = [];
    const lowerText = text.toLowerCase();
    
    // Location-based features
    if (lowerText.includes('downtown') || lowerText.includes('city center') || lowerText.includes('walkable')) {
      highlights.push({ icon: MapPin, text: 'Prime Location', color: 'text-blue-600', bgColor: 'bg-blue-50' });
    }
    
    // Quality & luxury features
    if (lowerText.includes('luxury') || lowerText.includes('premium') || lowerText.includes('upscale') || lowerText.includes('elegant')) {
      highlights.push({ icon: Star, text: 'Luxury Experience', color: 'text-amber-600', bgColor: 'bg-amber-50' });
    }
    
    // Dining & kitchen features
    if (lowerText.includes('coffee') || lowerText.includes('dining') || lowerText.includes('restaurant') || lowerText.includes('kitchen')) {
      highlights.push({ icon: Coffee, text: 'Great Dining Options', color: 'text-green-600', bgColor: 'bg-green-50' });
    }
    
    // Parking & transportation
    if (lowerText.includes('parking') || lowerText.includes('garage') || lowerText.includes('car') || lowerText.includes('transport')) {
      highlights.push({ icon: Car, text: 'Convenient Parking', color: 'text-gray-600', bgColor: 'bg-gray-50' });
    }
    
    // Tech & connectivity
    if (lowerText.includes('wifi') || lowerText.includes('internet') || lowerText.includes('high-speed') || lowerText.includes('remote work')) {
      highlights.push({ icon: Wifi, text: 'High-Speed Internet', color: 'text-indigo-600', bgColor: 'bg-indigo-50' });
    }
    
    // Family & group features
    if (lowerText.includes('family') || lowerText.includes('kids') || lowerText.includes('children') || lowerText.includes('group')) {
      highlights.push({ icon: Users, text: 'Family Friendly', color: 'text-purple-600', bgColor: 'bg-purple-50' });
    }
    
    // Romantic & couple features
    if (lowerText.includes('romantic') || lowerText.includes('couple') || lowerText.includes('honeymoon') || lowerText.includes('intimate')) {
      highlights.push({ icon: Heart, text: 'Romantic Getaway', color: 'text-rose-600', bgColor: 'bg-rose-50' });
    }
    
    // Safety & security
    if (lowerText.includes('safe') || lowerText.includes('secure') || lowerText.includes('security') || lowerText.includes('gated')) {
      highlights.push({ icon: Shield, text: 'Safe & Secure', color: 'text-emerald-600', bgColor: 'bg-emerald-50' });
    }
    
    // Outdoor & nature features
    if (lowerText.includes('outdoor') || lowerText.includes('garden') || lowerText.includes('patio') || lowerText.includes('nature') || lowerText.includes('view')) {
      highlights.push({ icon: TreePine, text: 'Beautiful Outdoor Space', color: 'text-green-700', bgColor: 'bg-green-50' });
    }
    
    // Cooking & kitchen amenities
    if (lowerText.includes('fully equipped') || lowerText.includes('gourmet') || lowerText.includes('cooking') || lowerText.includes('chef')) {
      highlights.push({ icon: Utensils, text: 'Gourmet Kitchen', color: 'text-orange-600', bgColor: 'bg-orange-50' });
    }
    
    // Return only the first 4 most relevant highlights
    return highlights.slice(0, 4);
  };

  const highlights = extractHighlights(description);
  const needsExpansion = sections.length > 1 || description.length > 300;

  if (isMobile) {
    return (
      <div className="space-y-6">
        {/* Enhanced Key Highlights - Mobile */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {highlights.map((highlight, index) => (
              <div key={index} className={`flex items-center ${highlight.bgColor} rounded-xl px-3 py-2.5 border border-gray-100`}>
                <highlight.icon className={`h-4 w-4 mr-2 ${highlight.color} flex-shrink-0`} />
                <span className="font-medium text-gray-700 text-sm leading-tight">{highlight.text}</span>
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
    <div className="space-y-8">
      {/* Enhanced Key Highlights - Desktop */}
      {highlights.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {highlights.map((highlight, index) => (
            <div key={index} className={`flex items-center ${highlight.bgColor} rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <highlight.icon className={`h-6 w-6 mr-3 ${highlight.color} flex-shrink-0`} />
              <span className="font-semibold text-gray-700 text-sm leading-tight">{highlight.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Description Layout */}
      <div className="grid gap-8">
        {/* Primary Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg font-medium mb-0">
              {firstSection}
            </p>
          </div>
        </div>

        {/* Additional Sections */}
        {remainingSections.length > 0 && (
          <div className="space-y-6">
            {remainingSections.map((section, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-0 text-base">
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
