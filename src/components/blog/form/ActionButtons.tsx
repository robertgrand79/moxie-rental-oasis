
import React from 'react';
import { Button } from '@/components/ui/button';
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

interface ActionButtonsProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  onSubmit: (data: ExtendedBlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const ActionButtons = ({ form, onSubmit, isEditing, onCancel }: ActionButtonsProps) => {
  const { handleSubmit, formState: { isSubmitting } } = form;

  return (
    <div className="flex gap-4 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleSubmit((data) => {
          onSubmit({ ...data, status: 'draft' });
        })}
        disabled={isSubmitting}
      >
        Save as Draft
      </Button>
      
      <Button
        type="button"
        onClick={handleSubmit((data) => {
          onSubmit({ ...data, status: 'published' });
        })}
        disabled={isSubmitting}
      >
        {isEditing ? 'Update & Publish' : 'Publish'}
      </Button>
    </div>
  );
};

export default ActionButtons;
