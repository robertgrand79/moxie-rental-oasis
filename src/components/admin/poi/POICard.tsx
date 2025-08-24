
import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, Sparkles, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import ContentSuggestions from '@/components/admin/ContentSuggestions';
import POIInlineEditor from './POIInlineEditor';
import { POIFormData } from './POIFormFields';

interface POICardProps {
  poi: PointOfInterest;
  onEdit: (poi: PointOfInterest) => void;
  onDelete: (id: string) => void;
  onEnhance: (poi: PointOfInterest) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  suggestions: Array<any>;
  // Inline editing props
  isEditing: boolean;
  onToggleEdit: (poi: PointOfInterest) => void;
  editFormData: POIFormData | null;
  setEditFormData: (data: POIFormData) => void;
  onSubmitInlineEdit: (data: POIFormData & { created_by: string }) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
  isSubmitting: boolean;
}

const POICard = ({ 
  poi, 
  onEdit, 
  onDelete, 
  onEnhance, 
  isEnhancing, 
  enhancingId, 
  suggestions,
  isEditing,
  onToggleEdit,
  editFormData,
  setEditFormData,
  onSubmitInlineEdit,
  categories,
  isSubmitting
}: POICardProps) => {
  const handleCancelEdit = () => {
    onToggleEdit(poi);
  };

  const handleToggleEditClick = () => {
    onToggleEdit(poi);
  };

  return (
    <Collapsible open={isEditing} onOpenChange={() => handleToggleEditClick()}>
      <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
        isEditing ? 'border-primary shadow-lg' : 'border-border'
      }`}>
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-muted/5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg truncate">{poi.name}</h4>
                  <div className="flex flex-wrap gap-1 flex-shrink-0">
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Badge variant="secondary" className="text-xs w-fit">
                    {poi.category}
                  </Badge>
                  <div className="flex items-center min-w-0">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{poi.address}</span>
                  </div>
                </div>

                {poi.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{poi.description}</p>
                )}

                {poi.website_url && (
                  <div className="flex gap-2">
                    <EnhancedButton size="sm" variant="outline" asChild className="min-h-[44px] sm:min-h-auto">
                      <a href={poi.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Website
                      </a>
                    </EnhancedButton>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0">
                <EnhancedButton
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnhance(poi);
                  }}
                  disabled={isEnhancing && enhancingId === poi.id}
                  className="min-h-[44px] sm:min-h-auto"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(poi);
                  }}
                  className="min-h-[44px] sm:min-h-auto"
                >
                  <Edit className="h-4 w-4" />
                </EnhancedButton>
                <EnhancedButton
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(poi.id);
                  }}
                  className="min-h-[44px] sm:min-h-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </EnhancedButton>
                {isEditing ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="animate-accordion-down">
          {isEditing && editFormData && (
            <div className="px-4 pb-4">
              <POIInlineEditor
                formData={editFormData}
                setFormData={setEditFormData}
                categories={categories}
                poi={poi}
                onSubmit={onSubmitInlineEdit}
                onCancel={handleCancelEdit}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </CollapsibleContent>
        
        {suggestions.length > 0 && !isEditing && (
          <div className="p-4 pt-0">
            <ContentSuggestions
              suggestions={suggestions}
              title="Related Content"
            />
          </div>
        )}
      </div>
    </Collapsible>
  );
};

export default POICard;
