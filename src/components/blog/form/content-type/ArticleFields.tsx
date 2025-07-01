
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTENT_TYPE_CATEGORIES } from '@/types/blogPost';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface ArticleFieldsProps {
  form: UseFormReturn<ExtendedBlogFormData>;
}

const ArticleFields = ({ form }: ArticleFieldsProps) => {
  const { register, setValue, watch } = form;
  const watchedValues = watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📝 Article Settings
        </CardTitle>
        <CardDescription>
          Standard blog article configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPE_CATEGORIES.article.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              type="number"
              {...register('display_order', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_featured"
            checked={watchedValues.is_featured}
            onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
          />
          <Label htmlFor="is_featured">Featured content</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleFields;
