
import React from 'react';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import ReactQuillEditor from '@/components/ReactQuillEditor';
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

interface EditorSectionProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  content: string;
  onContentChange: (content: string) => void;
  isEditing: boolean;
}

const EditorSection = ({ form, content, onContentChange, isEditing }: EditorSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Content *</Label>
        <div className="mt-2">
          <ReactQuillEditor
            value={content}
            onChange={onContentChange}
            placeholder={isEditing ? "Edit your content..." : "Start writing your content..."}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorSection;
