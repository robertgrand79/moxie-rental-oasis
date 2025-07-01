
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import ImageUploader from '@/components/ImageUploader';
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

interface ImageSectionProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
}

const ImageSection = ({ form, uploadedImage, onImageChange }: ImageSectionProps) => {
  const { register } = form;

  return (
    <div className="space-y-4">
      <div>
        <Label>Featured Image</Label>
        <ImageUploader
          currentImage={uploadedImage}
          onImageUploaded={onImageChange}
          maxSizeInMB={5}
        />
      </div>

      {uploadedImage && (
        <div>
          <Label htmlFor="image_credit">Image Credit (optional)</Label>
          <Input
            id="image_credit"
            {...register('image_credit')}
            placeholder="Photo credit or attribution"
          />
        </div>
      )}
    </div>
  );
};

export default ImageSection;
