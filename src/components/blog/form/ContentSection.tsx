
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
  author: string;
  published_at: Date | null;
  image_credit: string;
}

interface ContentSectionProps {
  form: UseFormReturn<BlogFormData>;
}

const ContentSection = ({ form }: ContentSectionProps) => {
  const { register } = form;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          {...register('excerpt')}
          placeholder="Brief description of the post..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="travel, eugene, accommodation"
        />
      </div>
    </div>
  );
};

export default ContentSection;
