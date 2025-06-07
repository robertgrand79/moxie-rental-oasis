
import { useQuery } from '@tanstack/react-query';
import { useEugeneEvents } from './useEugeneEvents';
import { usePointsOfInterest } from './usePointsOfInterest';
import { useLifestyleGallery } from './useLifestyleGallery';

export interface ContentSuggestion {
  id: string;
  type: 'event' | 'poi' | 'lifestyle';
  title: string;
  location?: string;
  category: string;
  relevanceScore: number;
}

export const useCrossContentIntegration = () => {
  const { events } = useEugeneEvents();
  const { pointsOfInterest } = usePointsOfInterest();
  const { galleryItems } = useLifestyleGallery();

  const getLocationBasedSuggestions = (location: string, excludeId?: string, excludeType?: string) => {
    const suggestions: ContentSuggestion[] = [];

    // Get related events
    events
      .filter(event => 
        event.location?.toLowerCase().includes(location.toLowerCase()) && 
        event.id !== excludeId &&
        'event' !== excludeType
      )
      .forEach(event => {
        suggestions.push({
          id: event.id,
          type: 'event',
          title: event.title,
          location: event.location,
          category: event.category || 'general',
          relevanceScore: calculateRelevanceScore(event.location || '', location)
        });
      });

    // Get related POIs
    pointsOfInterest
      .filter(poi => 
        poi.address?.toLowerCase().includes(location.toLowerCase()) && 
        poi.id !== excludeId &&
        'poi' !== excludeType
      )
      .forEach(poi => {
        suggestions.push({
          id: poi.id,
          type: 'poi',
          title: poi.name,
          location: poi.address,
          category: poi.category,
          relevanceScore: calculateRelevanceScore(poi.address || '', location)
        });
      });

    // Get related lifestyle items
    galleryItems
      .filter(item => 
        item.location?.toLowerCase().includes(location.toLowerCase()) && 
        item.id !== excludeId &&
        'lifestyle' !== excludeType
      )
      .forEach(item => {
        suggestions.push({
          id: item.id,
          type: 'lifestyle',
          title: item.title,
          location: item.location,
          category: item.category,
          relevanceScore: calculateRelevanceScore(item.location || '', location)
        });
      });

    return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
  };

  const getCategoryBasedSuggestions = (category: string, excludeId?: string, excludeType?: string) => {
    const suggestions: ContentSuggestion[] = [];

    // Get related events by category
    events
      .filter(event => 
        event.category === category && 
        event.id !== excludeId &&
        'event' !== excludeType
      )
      .forEach(event => {
        suggestions.push({
          id: event.id,
          type: 'event',
          title: event.title,
          location: event.location,
          category: event.category || 'general',
          relevanceScore: 1.0
        });
      });

    // Get related POIs by category
    pointsOfInterest
      .filter(poi => 
        poi.category === category && 
        poi.id !== excludeId &&
        'poi' !== excludeType
      )
      .forEach(poi => {
        suggestions.push({
          id: poi.id,
          type: 'poi',
          title: poi.name,
          location: poi.address,
          category: poi.category,
          relevanceScore: 1.0
        });
      });

    // Get related lifestyle items by category
    galleryItems
      .filter(item => 
        item.category === category && 
        item.id !== excludeId &&
        'lifestyle' !== excludeType
      )
      .forEach(item => {
        suggestions.push({
          id: item.id,
          type: 'lifestyle',
          title: item.title,
          location: item.location,
          category: item.category,
          relevanceScore: 1.0
        });
      });

    return suggestions.slice(0, 5);
  };

  const getContentStats = () => {
    return {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.is_active).length,
      featuredEvents: events.filter(e => e.is_featured).length,
      totalPOIs: pointsOfInterest.length,
      activePOIs: pointsOfInterest.filter(p => p.is_active).length,
      featuredPOIs: pointsOfInterest.filter(p => p.is_featured).length,
      totalLifestyle: galleryItems.length,
      activeLifestyle: galleryItems.filter(l => l.is_active).length,
      featuredLifestyle: galleryItems.filter(l => l.is_featured).length,
    };
  };

  return {
    getLocationBasedSuggestions,
    getCategoryBasedSuggestions,
    getContentStats
  };
};

const calculateRelevanceScore = (text1: string, text2: string): number => {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matches++;
    }
  });
  
  return matches / Math.max(words1.length, words2.length);
};
