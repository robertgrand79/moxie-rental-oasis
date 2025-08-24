import React from 'react';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, Sparkles, MapPin } from 'lucide-react';
import POIPhotoUpload from './POIPhotoUpload';

interface POICardViewProps {
  poi: PointOfInterest;
  onEdit: (poi: PointOfInterest) => void;
  onDelete: (id: string) => void;
  onEnhance: (poi: PointOfInterest) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  onPhotoUpdate: (poiId: string, imageUrl: string) => void;
}

const POICardView = ({ 
  poi, 
  onEdit, 
  onDelete, 
  onEnhance, 
  isEnhancing, 
  enhancingId,
  onPhotoUpdate
}: POICardViewProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-background shadow-sm hover:shadow-md transition-all duration-200">
      {/* Photo Upload Section */}
      <div className="p-4 pb-3">
        <POIPhotoUpload 
          poi={poi} 
          onPhotoUpdate={onPhotoUpdate}
          className="w-full"
        />
      </div>

      {/* Content Section */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          {/* Title and Badges */}
          <div className="space-y-2">
            <h4 className="font-semibold text-lg break-words leading-tight">{poi.name}</h4>
            <div className="flex flex-wrap gap-1">
              {poi.is_featured && (
                <Badge className="bg-blue-600 text-white text-xs">Featured</Badge>
              )}
              <Badge variant={poi.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                {poi.status}
              </Badge>
              {!poi.is_active && (
                <Badge variant="outline" className="text-xs">Inactive</Badge>
              )}
            </div>
          </div>

          {/* Category and Address */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs w-fit">
              {poi.category}
            </Badge>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <span className="break-words leading-tight">{poi.address}</span>
            </div>
          </div>

          {/* Description */}
          {poi.description && (
            <p className="text-muted-foreground text-sm break-words leading-relaxed line-clamp-3">
              {poi.description}
            </p>
          )}

          {/* Website Link */}
          {poi.website_url && (
            <div className="pt-1">
              <EnhancedButton size="sm" variant="outline" asChild>
                <a href={poi.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Website
                </a>
              </EnhancedButton>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
          <EnhancedButton
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
          </EnhancedButton>
          <EnhancedButton
            size="sm"
            variant="outline"
            onClick={() => onEdit(poi)}
          >
            <Edit className="h-4 w-4" />
          </EnhancedButton>
          <EnhancedButton
            size="sm"
            variant="destructive"
            onClick={() => onDelete(poi.id)}
          >
            <Trash2 className="h-4 w-4" />
          </EnhancedButton>
        </div>
      </div>
    </div>
  );
};

export default POICardView;