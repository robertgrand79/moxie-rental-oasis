
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, Sparkles, MapPin } from 'lucide-react';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import ContentSuggestions from '@/components/admin/ContentSuggestions';

interface POICardProps {
  poi: PointOfInterest;
  onEdit: (poi: PointOfInterest) => void;
  onDelete: (id: string) => void;
  onEnhance: (poi: PointOfInterest) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  suggestions: Array<any>;
}

const POICard = ({ 
  poi, 
  onEdit, 
  onDelete, 
  onEnhance, 
  isEnhancing, 
  enhancingId, 
  suggestions 
}: POICardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">{poi.name}</h4>
              <div className="flex gap-1">
                {poi.is_featured && (
                  <Badge className="bg-blue-600 text-white">Featured</Badge>
                )}
                {!poi.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Badge variant="secondary" className="mr-3">
                {poi.category}
              </Badge>
              <MapPin className="h-4 w-4 mr-1" />
              <span>{poi.address}</span>
            </div>

            {poi.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{poi.description}</p>
            )}

            {poi.website_url && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={poi.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Website
                  </a>
                </Button>
              </div>
            )}
          </div>

          <div className="flex space-x-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEnhance(poi)}
              disabled={isEnhancing && enhancingId === poi.id}
            >
              {isEnhancing && enhancingId === poi.id ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(poi)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(poi.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {suggestions.length > 0 && (
        <div className="p-4 pt-0">
          <ContentSuggestions
            suggestions={suggestions}
            title="Related Content"
          />
        </div>
      )}
    </div>
  );
};

export default POICard;
