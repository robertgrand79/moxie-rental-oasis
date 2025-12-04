import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Wrench, Image as ImageIcon } from 'lucide-react';
import { ChecklistItem, ItemCompletion } from '@/hooks/useChecklistManagement';

interface FlaggedItem {
  item: ChecklistItem;
  completion: ItemCompletion & { photos?: string[]; needs_work?: boolean };
}

interface ChecklistSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flaggedItems: FlaggedItem[];
  propertyId: string;
  propertyTitle: string;
  checklistName: string;
  onCreateWorkOrders: (items: FlaggedItem[], combined: boolean) => Promise<void>;
}

const ChecklistSummaryModal = ({
  open,
  onOpenChange,
  flaggedItems,
  propertyTitle,
  checklistName,
  onCreateWorkOrders,
}: ChecklistSummaryModalProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(flaggedItems.map((f) => f.completion.id))
  );
  const [isCreating, setIsCreating] = useState(false);

  const toggleItem = (completionId: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(completionId)) {
      newSet.delete(completionId);
    } else {
      newSet.add(completionId);
    }
    setSelectedItems(newSet);
  };

  const handleCreateWorkOrders = async (combined: boolean) => {
    const selected = flaggedItems.filter((f) => selectedItems.has(f.completion.id));
    if (selected.length === 0) return;

    setIsCreating(true);
    try {
      await onCreateWorkOrders(selected, combined);
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCount = selectedItems.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Items Needing Work
          </DialogTitle>
          <DialogDescription>
            {flaggedItems.length} items flagged during "{checklistName}" at {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {flaggedItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No items were flagged as needing work.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedCount} of {flaggedItems.length} items selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedCount === flaggedItems.length) {
                      setSelectedItems(new Set());
                    } else {
                      setSelectedItems(new Set(flaggedItems.map((f) => f.completion.id)));
                    }
                  }}
                >
                  {selectedCount === flaggedItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-3">
                {flaggedItems.map(({ item, completion }) => (
                  <Card
                    key={completion.id}
                    className={`transition-colors ${
                      selectedItems.has(completion.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedItems.has(completion.id)}
                          onCheckedChange={() => toggleItem(completion.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                          {completion.notes && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <span className="font-medium">Notes:</span> {completion.notes}
                            </div>
                          )}
                          {completion.photos && completion.photos.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {completion.photos.length} photo(s) attached
                              </span>
                              <div className="flex gap-1">
                                {completion.photos.slice(0, 3).map((photo, i) => (
                                  <img
                                    key={i}
                                    src={photo}
                                    alt={`Issue ${i + 1}`}
                                    className="w-10 h-10 object-cover rounded border"
                                  />
                                ))}
                                {completion.photos.length > 3 && (
                                  <div className="w-10 h-10 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                                    +{completion.photos.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleCreateWorkOrders(false)}
              disabled={selectedCount === 0 || isCreating}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Create {selectedCount} Work Order{selectedCount !== 1 ? 's' : ''}
            </Button>
            <Button
              onClick={() => handleCreateWorkOrders(true)}
              disabled={selectedCount === 0 || isCreating}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Create Combined Work Order
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistSummaryModal;
