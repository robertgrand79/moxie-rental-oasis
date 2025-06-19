
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import BasicInfoSection from './form/BasicInfoSection';
import ContentSection from './form/ContentSection';
import ImageSection from './form/ImageSection';
import EditorSection from './form/EditorSection';
import ActionButtons from './form/ActionButtons';

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

interface BlogEditorFormProps {
  form: UseFormReturn<BlogFormData>;
  content: string;
  onContentChange: (content: string) => void;
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
  onSubmit: (data: BlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const BlogEditorForm = ({
  form,
  content,
  onContentChange,
  uploadedImage,
  onImageChange,
  onSubmit,
  isEditing,
  onCancel
}: BlogEditorFormProps) => {
  return (
    <div className="space-y-6">
      {/* Top Section: Basic Info Fields */}
      <BasicInfoSection form={form} />

      {/* Content Section: Excerpt and Tags */}
      <ContentSection form={form} />

      {/* Featured Image Section */}
      <ImageSection 
        form={form}
        uploadedImage={uploadedImage}
        onImageChange={onImageChange}
      />

      {/* Bottom Section: Content Editor (Full Width) */}
      <EditorSection 
        form={form}
        content={content}
        onContentChange={onContentChange}
      />

      {/* Action Buttons */}
      <ActionButtons 
        form={form}
        onSubmit={onSubmit}
        isEditing={isEditing}
        onCancel={onCancel}
      />
    </div>
  );
};

export default BlogEditorForm;
