
import React from 'react';
import { Button } from '@/components/ui/button';
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
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{poi.name}</h4>
                  <div className="flex gap-1">
                    {poi.is_featured && (
                      <Badge className="bg-blue-600 text-white">Featured</Badge>
                    )}
                    <Badge variant={poi.status === 'published' ? 'default' : 'secondary'}>
                      {poi.status}
                    </Badge>
                    {!poi.is_active && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Badge variant="secondary" className="mr-3">
                    {poi.category}
                  </Badge>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{poi.address}</span>
                </div>

                {poi.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{poi.description}</p>
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

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnhance(poi);
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(poi);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(poi.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
