
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import { ContentType } from '@/types/blogPost';

// Updated interface to match the extended form data
interface ExtendedBlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
  author: string;
  published_at: Date | null;
  image_credit: string;
  content_type: ContentType;
  category: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  location: string;
  latitude?: number;
  longitude?: number;
  address: string;
  event_date?: Date | null;
  end_date?: Date | null;
  time_start: string;
  time_end: string;
  ticket_url: string;
  price_range: string;
  is_recurring: boolean;
  recurrence_pattern: string;
  rating?: number;
  phone: string;
  website_url: string;
  activity_type: string;
}

interface ContentSectionProps {
  form: UseFormReturn<ExtendedBlogFormData>;
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
