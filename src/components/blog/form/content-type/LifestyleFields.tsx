
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTENT_TYPE_CATEGORIES } from '@/types/blogPost';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface LifestyleFieldsProps {
  form: UseFormReturn<ExtendedBlogFormData>;
}

const LifestyleFields = ({ form }: LifestyleFieldsProps) => {
  const { register, setValue, watch, formState: { errors } } = form;
  const watchedValues = watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎨 Lifestyle Content Details
        </CardTitle>
        <CardDescription>
          Activity and experience information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Lifestyle Category</Label>
            <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPE_CATEGORIES.lifestyle.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="activity_type">Activity Type *</Label>
            <Input {...register('activity_type', { required: 'Activity type is required' })} />
            {errors.activity_type && <p className="text-sm text-red-500">{errors.activity_type.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location (if applicable)</Label>
          <Input {...register('location')} placeholder="City, State" />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_featured"
            checked={watchedValues.is_featured}
            onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
          />
          <Label htmlFor="is_featured">Featured Lifestyle Content</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default LifestyleFields;
