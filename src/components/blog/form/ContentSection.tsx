import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface ContentSectionProps {
  form: UseFormReturn<ExtendedBlogFormData>;
}

const ContentSection = ({ form }: ContentSectionProps) => {
  const { register, setValue, watch } = form;
  const watchedValues = watch();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Textarea
          id="excerpt"
          {...register('excerpt')}
          placeholder="Brief description of the post..."
          rows={3}
          enableAI={true}
          aiLabel="Excerpt"
          aiPrompt="Generate a compelling blog post excerpt/summary that will entice readers to click and read more. Keep it under 160 characters for SEO."
          aiTooltip="Generate excerpt with AI"
          value={watchedValues.excerpt || ''}
          onValueChange={(value) => setValue('excerpt', value)}
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
