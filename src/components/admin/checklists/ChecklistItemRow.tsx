import { useState, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Camera, X, AlertTriangle, Loader2 } from 'lucide-react';
import { ChecklistItem, ItemCompletion } from '@/hooks/useChecklistManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtendedCompletion extends ItemCompletion {
  photos?: string[];
  needs_work?: boolean;
}

interface ChecklistItemRowProps {
  item: ChecklistItem;
  completion: ExtendedCompletion;
  isUpdating: boolean;
  onToggleComplete: () => void;
  onUpdateCompletion: (updates: {
    notes?: string;
    photos?: string[];
    needs_work?: boolean;
  }) => Promise<void>;
}

const ChecklistItemRow = ({
  item,
  completion,
  isUpdating,
  onToggleComplete,
  onUpdateCompletion,
}: ChecklistItemRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(completion.notes || '');
  const [needsWork, setNeedsWork] = useState(completion.needs_work || false);
  const [photos, setPhotos] = useState<string[]>(completion.photos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newPhotos: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${completion.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('checklist-photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('checklist-photos')
          .getPublicUrl(fileName);

        newPhotos.push(publicUrl);
      }

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      await onUpdateCompletion({ photos: updatedPhotos });
      
      toast({ title: 'Photos uploaded successfully' });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({ title: 'Failed to upload photos', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    const updatedPhotos = photos.filter((p) => p !== photoUrl);
    setPhotos(updatedPhotos);
    await onUpdateCompletion({ photos: updatedPhotos });
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await onUpdateCompletion({ notes, needs_work: needsWork });
      toast({ title: 'Notes saved' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNeedsWorkChange = async (checked: boolean) => {
    setNeedsWork(checked);
    await onUpdateCompletion({ needs_work: checked });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div
        className={`rounded-lg border transition-colors ${
          completion.is_completed
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : needsWork
            ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
            : 'bg-card border-border hover:bg-accent/50'
        }`}
      >
        <div className="flex items-start gap-3 p-3">
          <Checkbox
            checked={completion.is_completed}
            disabled={isUpdating}
            onCheckedChange={onToggleComplete}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={`font-medium ${
                  completion.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {item.title}
              </p>
              {needsWork && (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
              {photos.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  📷 {photos.length}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
            )}
            {completion.completed_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Completed {new Date(completion.completed_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 space-y-4 border-t border-border/50 mt-2">
            {/* Needs Work Toggle */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <Label htmlFor={`needs-work-${completion.id}`} className="text-sm font-medium">
                  Needs Work
                </Label>
              </div>
              <Switch
                id={`needs-work-${completion.id}`}
                checked={needsWork}
                onCheckedChange={handleNeedsWorkChange}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this item..."
                rows={2}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveNotes}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save Notes
              </Button>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Photos</Label>
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Issue ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      onClick={() => handleRemovePhoto(photo)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-20 h-20 border-2 border-dashed border-border rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      <span className="text-xs mt-1">Add</span>
                    </>
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ChecklistItemRow;
