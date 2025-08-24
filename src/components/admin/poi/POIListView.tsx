import React from 'react';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, Sparkles, ImageIcon } from 'lucide-react';

interface POIListViewProps {
  pointsOfInterest: PointOfInterest[];
  onEdit: (poi: PointOfInterest) => void;
  onDelete: (id: string) => void;
  onEnhance: (poi: PointOfInterest) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
}

const POIListView = ({ 
  pointsOfInterest, 
  onEdit, 
  onDelete, 
  onEnhance, 
  isEnhancing, 
  enhancingId 
}: POIListViewProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/30 font-medium text-sm">
        <div className="col-span-1"></div>
        <div className="col-span-3">Name</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-3">Address</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {pointsOfInterest.map((poi) => (
          <div key={poi.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/20 transition-colors">
            {/* Thumbnail */}
            <div className="col-span-1">
              {poi.image_url ? (
                <img
                  src={poi.image_url}
                  alt={poi.name}
                  className="w-10 h-8 object-cover rounded border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-8 bg-muted rounded border flex items-center justify-center">
                  <ImageIcon className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Name */}
            <div className="col-span-3">
              <div className="font-medium break-words leading-tight">{poi.name}</div>
              {poi.is_featured && (
                <Badge className="bg-blue-600 text-white text-xs mt-1">Featured</Badge>
              )}
            </div>

            {/* Category */}
            <div className="col-span-2">
              <Badge variant="secondary" className="text-xs">
                {poi.category}
              </Badge>
            </div>

            {/* Address */}
            <div className="col-span-3">
              <span className="text-sm text-muted-foreground break-words leading-tight">
                {poi.address}
              </span>
            </div>

            {/* Status */}
            <div className="col-span-1">
              <div className="space-y-1">
                <Badge variant={poi.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                  {poi.status}
                </Badge>
                {!poi.is_active && (
                  <Badge variant="outline" className="text-xs block">Inactive</Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-1">
              {poi.website_url && (
                <EnhancedButton size="sm" variant="ghost" asChild>
                  <a href={poi.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </EnhancedButton>
              )}
              <EnhancedButton
                size="sm"
                variant="ghost"
                onClick={() => onEnhance(poi)}
                disabled={isEnhancing && enhancingId === poi.id}
              >
                {isEnhancing && enhancingId === poi.id ? (
                  <Sparkles className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
              </EnhancedButton>
              <EnhancedButton
                size="sm"
                variant="ghost"
                onClick={() => onEdit(poi)}
              >
                <Edit className="h-3 w-3" />
              </EnhancedButton>
              <EnhancedButton
                size="sm"
                variant="ghost"
                onClick={() => onDelete(poi.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </EnhancedButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default POIListView;