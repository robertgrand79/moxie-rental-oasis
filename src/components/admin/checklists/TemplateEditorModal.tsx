import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ChecklistTemplate, ChecklistItem } from '@/hooks/useChecklistManagement';

interface CategoryWithItems {
  name: string;
  items: { title: string; description: string }[];
}

interface TemplateEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ChecklistTemplate | null;
  onSave: (data: {
    name: string;
    type: string;
    description: string;
    categories: CategoryWithItems[];
  }) => Promise<void>;
}

const TemplateEditorModal = ({ open, onOpenChange, template, onSave }: TemplateEditorModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setType(template.type);
      setDescription(template.description || '');
      
      // Group items by category
      const items = template.items || [];
      const categoryMap = new Map<string, { title: string; description: string }[]>();
      items.forEach((item) => {
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, []);
        }
        categoryMap.get(item.category)!.push({
          title: item.title,
          description: item.description || '',
        });
      });
      
      setCategories(
        Array.from(categoryMap.entries()).map(([name, items]) => ({ name, items }))
      );
    } else {
      resetForm();
    }
  }, [template, open]);

  const resetForm = () => {
    setName('');
    setType('custom');
    setDescription('');
    setCategories([]);
    setNewCategoryName('');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    setCategories([...categories, { name: newCategoryName.trim(), items: [] }]);
    setNewCategoryName('');
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleCategoryNameChange = (index: number, newName: string) => {
    const updated = [...categories];
    updated[index].name = newName;
    setCategories(updated);
  };

  const handleAddItem = (categoryIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].items.push({ title: '', description: '' });
    setCategories(updated);
  };

  const handleRemoveItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].items = updated[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setCategories(updated);
  };

  const handleItemChange = (
    categoryIndex: number,
    itemIndex: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex][field] = value;
    setCategories(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        type,
        description: description.trim(),
        categories: categories.filter(c => c.name.trim() && c.items.length > 0),
      });
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const isEditing = !!template;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Checklist Template' : 'Create Custom Checklist'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the checklist template details and items.'
              : 'Create a new checklist template with categories and items.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Checklist Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekly Inspection"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">✏️ Custom</SelectItem>
                  <SelectItem value="monthly">📅 Monthly</SelectItem>
                  <SelectItem value="quarterly">📊 Quarterly</SelectItem>
                  <SelectItem value="fall">🍂 Fall</SelectItem>
                  <SelectItem value="spring">🌷 Spring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this checklist is for..."
              rows={2}
            />
          </div>

          {/* Categories & Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Categories & Items</Label>
            </div>

            {/* Add new category */}
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name (e.g., Exterior, Interior, Safety)"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button type="button" variant="outline" onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>

            {/* Categories list */}
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No categories yet. Add a category to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {categories.map((category, catIndex) => (
                  <Card key={catIndex}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <Input
                          value={category.name}
                          onChange={(e) => handleCategoryNameChange(catIndex, e.target.value)}
                          className="font-medium"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCategory(catIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={item.title}
                              onChange={(e) => handleItemChange(catIndex, itemIndex, 'title', e.target.value)}
                              placeholder="Item title"
                            />
                            <Input
                              value={item.description}
                              onChange={(e) => handleItemChange(catIndex, itemIndex, 'description', e.target.value)}
                              placeholder="Description (optional)"
                              className="text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(catIndex, itemIndex)}
                            className="text-muted-foreground hover:text-destructive mt-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddItem(catIndex)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Checklist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditorModal;
