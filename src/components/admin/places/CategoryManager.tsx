import React, { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useAllPlaceCategories,
  useUpdatePlaceCategory,
  useDeletePlaceCategory,
  PlaceCategory,
} from '@/hooks/usePlaceCategories';
import CategoryForm from './CategoryForm';
import * as LucideIcons from 'lucide-react';

const CategoryManager = () => {
  const { categories, isLoading } = useAllPlaceCategories();
  const updateCategory = useUpdatePlaceCategory();
  const deleteCategory = useDeletePlaceCategory();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PlaceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<PlaceCategory | null>(null);

  const handleEdit = (category: PlaceCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleToggleActive = async (category: PlaceCategory) => {
    await updateCategory.mutateAsync({
      id: category.id,
      is_active: !category.is_active,
    });
  };

  const handleDelete = async () => {
    if (deletingCategory) {
      await deleteCategory.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <LucideIcons.MapPin className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading categories...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Place Categories</CardTitle>
            <CardDescription>Manage categories for organizing places</CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No categories yet. Create your first category to get started.
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20', color: category.color }}
                    >
                      {getIconComponent(category.icon)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {category.name}
                        {!category.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{category.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={() => handleToggleActive(category)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCloseForm}
        />
      )}

      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
              Categories with places assigned cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryManager;
