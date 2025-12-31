import React, { useState, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Type, Megaphone, Upload, Loader2, Eye, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SignageSlide {
  id: string;
  type: 'image' | 'text' | 'promo';
  title: string;
  content: string;
  image_url: string;
  duration_override: number | null;
}

interface TVSignageSlidesEditorProps {
  slides: SignageSlide[];
  onSlidesChange: (slides: SignageSlide[]) => void;
}

const TVSignageSlidesEditor: React.FC<TVSignageSlidesEditorProps> = ({
  slides,
  onSlidesChange,
}) => {
  const { organization } = useCurrentOrganization();
  const [previewSlide, setPreviewSlide] = useState<SignageSlide | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const addSlide = (type: SignageSlide['type']) => {
    const newSlide: SignageSlide = {
      id: `slide_${Date.now()}`,
      type,
      title: type === 'text' ? 'Announcement' : type === 'promo' ? 'Special Offer' : 'Custom Slide',
      content: '',
      image_url: '',
      duration_override: null,
    };
    onSlidesChange([...slides, newSlide]);
  };

  const updateSlide = (id: string, updates: Partial<SignageSlide>) => {
    onSlidesChange(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSlide = (id: string) => {
    onSlidesChange(slides.filter(s => s.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex(s => s.id === active.id);
      const newIndex = slides.findIndex(s => s.id === over.id);
      onSlidesChange(arrayMove(slides, oldIndex, newIndex));
    }
  };

  const handleImageUpload = useCallback(async (slideId: string, file: File) => {
    if (!organization?.id) return;
    
    setUploadingFor(slideId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organization.id}/signage/${slideId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('organization-assets')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-assets')
        .getPublicUrl(fileName);

      updateSlide(slideId, { image_url: publicUrl });
      toast({ title: 'Image uploaded successfully' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingFor(null);
    }
  }, [organization?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Custom Signage Slides
        </CardTitle>
        <CardDescription>
          Add custom slides to your digital signage rotation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Slide Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => addSlide('image')}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Add Image Slide
          </Button>
          <Button variant="outline" size="sm" onClick={() => addSlide('text')}>
            <Type className="h-4 w-4 mr-2" />
            Add Text Slide
          </Button>
          <Button variant="outline" size="sm" onClick={() => addSlide('promo')}>
            <Megaphone className="h-4 w-4 mr-2" />
            Add Promo Slide
          </Button>
        </div>

        {/* Slides List */}
        {slides.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No custom slides yet. Add one above to get started.
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {slides.map((slide) => (
                  <SortableSlideItem
                    key={slide.id}
                    slide={slide}
                    onUpdate={(updates) => updateSlide(slide.id, updates)}
                    onRemove={() => removeSlide(slide.id)}
                    onPreview={() => setPreviewSlide(slide)}
                    onImageUpload={(file) => handleImageUpload(slide.id, file)}
                    isUploading={uploadingFor === slide.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!previewSlide} onOpenChange={() => setPreviewSlide(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Slide Preview</DialogTitle>
            </DialogHeader>
            {previewSlide && (
              <div className="aspect-video bg-background rounded-lg overflow-hidden border">
                <SlidePreview slide={previewSlide} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Sortable Slide Item
const SortableSlideItem: React.FC<{
  slide: SignageSlide;
  onUpdate: (updates: Partial<SignageSlide>) => void;
  onRemove: () => void;
  onPreview: () => void;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
}> = ({ slide, onUpdate, onRemove, onPreview, onImageUpload, isUploading }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeIcon = () => {
    switch (slide.type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'text': return <Type className="h-4 w-4" />;
      case 'promo': return <Megaphone className="h-4 w-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (slide.type) {
      case 'image': return 'Image';
      case 'text': return 'Text';
      case 'promo': return 'Promo';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg p-4 bg-card",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Slide Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTypeIcon()}
              <span className="text-sm font-medium">{getTypeLabel()} Slide</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onPreview}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onRemove}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={slide.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Slide title"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration Override (seconds)</Label>
              <Input
                type="number"
                value={slide.duration_override || ''}
                onChange={(e) => onUpdate({ duration_override: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Use default"
              />
            </div>
          </div>

          {/* Content based on type */}
          {slide.type === 'image' && (
            <div className="space-y-2">
              <Label>Image</Label>
              {slide.image_url ? (
                <div className="relative w-48 h-28 rounded overflow-hidden border">
                  <img src={slide.image_url} alt="Slide" className="object-cover w-full h-full" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => onUpdate({ image_url: '' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
                    disabled={isUploading}
                  />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              )}
            </div>
          )}

          {(slide.type === 'text' || slide.type === 'promo') && (
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={slide.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder={slide.type === 'promo' ? 'Enter your promotional message...' : 'Enter your announcement text...'}
                rows={3}
              />
            </div>
          )}

          {slide.type === 'promo' && (
            <div className="space-y-2">
              <Label>Background Image (optional)</Label>
              {slide.image_url ? (
                <div className="relative w-48 h-28 rounded overflow-hidden border">
                  <img src={slide.image_url} alt="Background" className="object-cover w-full h-full" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => onUpdate({ image_url: '' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
                    disabled={isUploading}
                  />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Slide Preview Component
const SlidePreview: React.FC<{ slide: SignageSlide }> = ({ slide }) => {
  if (slide.type === 'image' && slide.image_url) {
    return (
      <div className="w-full h-full relative">
        <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
        {slide.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="text-white text-2xl font-bold">{slide.title}</h3>
          </div>
        )}
      </div>
    );
  }

  if (slide.type === 'text') {
    return (
      <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold">{slide.title}</h3>
          <p className="text-xl text-muted-foreground max-w-2xl">{slide.content}</p>
        </div>
      </div>
    );
  }

  if (slide.type === 'promo') {
    return (
      <div 
        className="w-full h-full flex items-center justify-center p-12 relative"
        style={slide.image_url ? { 
          backgroundImage: `url(${slide.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {slide.image_url && <div className="absolute inset-0 bg-black/50" />}
        <div className={cn("text-center space-y-4 z-10", slide.image_url && "text-white")}>
          <span className="inline-block px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            Special Offer
          </span>
          <h3 className="text-4xl font-bold">{slide.title}</h3>
          <p className="text-xl opacity-90 max-w-2xl">{slide.content}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default TVSignageSlidesEditor;
