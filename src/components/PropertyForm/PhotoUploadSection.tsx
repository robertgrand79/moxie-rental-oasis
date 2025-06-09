import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Upload, X, Star, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface PhotoUploadSectionProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  isEditing?: boolean;
  existingImages?: string[];
  selectedCoverIndex?: number;
  onCoverSelect?: (index: number) => void;
  disabled?: boolean;
}

interface SortablePhotoItemProps {
  id: string;
  index: number;
  url: string;
  isSelected: boolean;
  isExisting: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
}

const SortablePhotoItem = ({ 
  id, 
  index, 
  url, 
  isSelected, 
  isExisting, 
  onSelect, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown, 
  disabled 
}: SortablePhotoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        className={cn(
          "relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all",
          isSelected 
            ? "border-primary ring-2 ring-primary/50" 
            : "border-gray-200 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          isDragging && "opacity-60 shadow-lg z-10"
        )}
        onClick={() => !disabled && onSelect()}
      >
        <img
          src={url}
          alt={`Property image ${index + 1}`}
          className="w-full h-24 object-cover"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <Star className="h-6 w-6 text-primary fill-current" />
          </div>
        )}
        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
          {isSelected ? 'Cover' : index + 1}
        </div>
        
        {/* Drag Handle */}
        {!disabled && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-1 right-1 p-1 bg-black/50 rounded cursor-grab hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Move Up */}
        {!disabled && canMoveUp && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.();
            }}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
        )}
        
        {/* Move Down */}
        {!disabled && canMoveDown && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.();
            }}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        )}

        {/* Remove (only for new uploads) */}
        {!isExisting && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

const PhotoUploadSection = ({ 
  photos, 
  onPhotosChange, 
  isEditing, 
  existingImages = [], 
  selectedCoverIndex,
  onCoverSelect,
  disabled = false
}: PhotoUploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  }, [disabled]);

  const addPhotos = (newFiles: File[]) => {
    if (disabled) return;
    
    const updatedPhotos = [...photos, ...newFiles];
    onPhotosChange(updatedPhotos);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    if (disabled) return;
    
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
    
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newUrls;
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  };

  const allImages = [...existingImages, ...previewUrls];
  const totalImageCount = allImages.length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = allImages.findIndex((_, index) => `photo-${index}` === active.id);
      const newIndex = allImages.findIndex((_, index) => `photo-${index}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newAllImages = arrayMove(allImages, oldIndex, newIndex);
        
        // Update selectedCoverIndex if the cover image was moved
        if (selectedCoverIndex === oldIndex) {
          onCoverSelect?.(newIndex);
        } else if (selectedCoverIndex !== undefined) {
          // Adjust cover index if other images were moved around it
          if (oldIndex < selectedCoverIndex && newIndex >= selectedCoverIndex) {
            onCoverSelect?.(selectedCoverIndex - 1);
          } else if (oldIndex > selectedCoverIndex && newIndex <= selectedCoverIndex) {
            onCoverSelect?.(selectedCoverIndex + 1);
          }
        }

        // Split the reordered images back into existing and new photos
        const newExistingImages = newAllImages.slice(0, existingImages.length);
        const newPreviewUrls = newAllImages.slice(existingImages.length);

        // Update preview URLs state
        setPreviewUrls(newPreviewUrls);
        
        // If photos need to be reordered, handle that logic here
        // For now, we'll keep existing behavior for new photos
      }
    }
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    
    const newAllImages = arrayMove(allImages, fromIndex, toIndex);
    
    // Update selectedCoverIndex
    if (selectedCoverIndex === fromIndex) {
      onCoverSelect?.(toIndex);
    } else if (selectedCoverIndex !== undefined) {
      if (fromIndex < selectedCoverIndex && toIndex >= selectedCoverIndex) {
        onCoverSelect?.(selectedCoverIndex - 1);
      } else if (fromIndex > selectedCoverIndex && toIndex <= selectedCoverIndex) {
        onCoverSelect?.(selectedCoverIndex + 1);
      }
    }

    // Update preview URLs
    const newPreviewUrls = newAllImages.slice(existingImages.length);
    setPreviewUrls(newPreviewUrls);
  };

  return (
    <div className="space-y-4">
      <FormLabel>Property Photos</FormLabel>
      
      {/* Existing Images Gallery */}
      {totalImageCount > 0 && (
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium">
            All Property Images ({totalImageCount}) - Drag to reorder, click to select cover photo
          </FormLabel>
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={allImages.map((_, index) => `photo-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allImages.map((url, index) => (
                  <SortablePhotoItem
                    key={`photo-${index}`}
                    id={`photo-${index}`}
                    index={index}
                    url={url}
                    isSelected={selectedCoverIndex === index}
                    isExisting={index < existingImages.length}
                    onSelect={() => !disabled && onCoverSelect?.(index)}
                    onRemove={index >= existingImages.length ? () => removePhoto(index - existingImages.length) : undefined}
                    onMoveUp={index > 0 ? () => movePhoto(index, index - 1) : undefined}
                    onMoveDown={index < allImages.length - 1 ? () => movePhoto(index, index + 1) : undefined}
                    canMoveUp={index > 0}
                    canMoveDown={index < allImages.length - 1}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <p className="text-xs text-muted-foreground">
            The starred image will be used as the cover photo. Drag images to reorder or use the arrow buttons.
          </p>
        </div>
      )}

      {/* Photo Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          !disabled && "hover:border-primary hover:bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {disabled ? 'Upload in progress...' : 'Add more photos'}
          </p>
          <p className="text-xs text-muted-foreground">
            {disabled ? 'Please wait while photos are being processed' : 'Drag and drop or click to select files (JPEG, PNG, WebP, GIF)'}
          </p>
          {!disabled && (
            <>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileInput}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                Choose Files
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadSection;
