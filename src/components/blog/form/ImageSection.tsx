
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import ImageUploader from '@/components/ImageUploader';

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

interface ImageSectionProps {
  form: UseFormReturn<BlogFormData>;
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
}

const ImageSection = ({ form, uploadedImage, onImageChange }: ImageSectionProps) => {
  const { register } = form;

  return (
    <div className="space-y-4">
      <ImageUploader
        uploadedImage={uploadedImage}
        onImageChange={onImageChange}
      />
      
      {/* Image Credit Field */}
      {uploadedImage && (
        <div>
          <Label htmlFor="image_credit">Image Credit (optional)</Label>
          <Textarea
            id="image_credit"
            {...register('image_credit')}
            placeholder="Paste image credit HTML here (e.g., from Unsplash)"
            rows={2}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Paste the credit HTML provided by Unsplash or other photo sources
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageSection;
