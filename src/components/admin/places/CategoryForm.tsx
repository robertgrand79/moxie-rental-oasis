import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreatePlaceCategory, useUpdatePlaceCategory, PlaceCategory } from '@/hooks/usePlaceCategories';

const AVAILABLE_ICONS = [
  'MapPin', 'Utensils', 'UtensilsCrossed', 'Coffee', 'Wine', 'Beer',
  'Mountain', 'Trees', 'Waves', 'Sun', 'Sunrise',
  'Music', 'Film', 'Theater', 'Gamepad2', 'Ticket',
  'ShoppingBag', 'ShoppingCart', 'Store', 'Gift',
  'Bed', 'Hotel', 'Home', 'Building',
  'Heart', 'Sparkles', 'Star', 'Camera',
  'Landmark', 'Church', 'Castle', 'GraduationCap',
  'Bike', 'Car', 'Plane', 'Sailboat',
  'Dumbbell', 'Trophy', 'Target',
];

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#6b7280',
];

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  icon: z.string().default('MapPin'),
  color: z.string().default('#6366f1'),
  display_order: z.number().default(0),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: PlaceCategory | null;
  onClose: () => void;
}

const CategoryForm = ({ category, onClose }: CategoryFormProps) => {
  const createCategory = useCreatePlaceCategory();
  const updateCategory = useUpdatePlaceCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      icon: category?.icon || 'MapPin',
      color: category?.color || '#6366f1',
      display_order: category?.display_order || 0,
      is_active: category?.is_active ?? true,
    },
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    if (!category) {
      form.setValue('slug', generateSlug(name));
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, ...data });
      } else {
        await createCategory.mutateAsync({
          name: data.name,
          slug: data.slug,
          icon: data.icon,
          color: data.color,
          display_order: data.display_order,
          is_active: data.is_active,
        });
      }
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{category ? 'Edit Category' : 'Add New Category'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Dining"
                        {...field}
                        onChange={handleNameChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., dining" {...field} />
                    </FormControl>
                    <FormDescription>URL-friendly identifier (lowercase, hyphens only)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {AVAILABLE_ICONS.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            field.value === color ? 'scale-125 border-foreground' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Lower numbers appear first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Show this category in dropdowns</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : category ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryForm;
