
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import ImageUploader from '@/components/ImageUploader';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

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
