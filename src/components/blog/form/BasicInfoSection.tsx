
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface BasicInfoSectionProps {
  form: UseFormReturn<ExtendedBlogFormData>;
}

const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  const { register, setValue, watch } = form;
  const watchedValues = watch();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter post title"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            {...register('author')}
            placeholder="Author name"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={watchedValues.status} onValueChange={(value) => setValue('status', value as 'draft' | 'published')}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {watchedValues.status === 'published' && (
        <div>
          <Label htmlFor="published_at">Published Date</Label>
          <Input
            id="published_at"
            type="datetime-local"
            {...register('published_at')}
          />
        </div>
      )}
    </div>
  );
};

export default BasicInfoSection;
