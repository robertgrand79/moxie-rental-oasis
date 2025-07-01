
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import BasicInfoSection from './form/BasicInfoSection';
import ContentSection from './form/ContentSection';
import ImageSection from './form/ImageSection';
import EditorSection from './form/EditorSection';
import ActionButtons from './form/ActionButtons';
import ContentTypeSelector from './ContentTypeSelector';
import ContentTypeFields from './form/ContentTypeFields';
import { ContentType } from '@/types/blogPost';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface BlogEditorFormProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  content: string;
  onContentChange: (content: string) => void;
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
  onSubmit: (data: ExtendedBlogFormData) => void;
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
  const watchedValues = form.watch();
  const currentContentType = watchedValues.content_type;

  const handleContentTypeChange = (newContentType: ContentType) => {
    form.setValue('content_type', newContentType);
    
    // Reset content-type-specific fields when changing types
    if (newContentType !== 'event') {
      form.setValue('event_date', null);
      form.setValue('end_date', null);
      form.setValue('time_start', '');
      form.setValue('time_end', '');
      form.setValue('ticket_url', '');
      form.setValue('price_range', '');
      form.setValue('is_recurring', false);
      form.setValue('recurrence_pattern', '');
    }
    
    if (newContentType !== 'poi') {
      form.setValue('rating', undefined);
      form.setValue('phone', '');
      form.setValue('website_url', '');
    }
    
    if (newContentType !== 'lifestyle') {
      form.setValue('activity_type', '');
    }
    
    if (newContentType === 'article') {
      form.setValue('location', '');
      form.setValue('address', '');
      form.setValue('latitude', undefined);
      form.setValue('longitude', undefined);
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Type Selection */}
      <ContentTypeSelector
        value={currentContentType}
        onValueChange={handleContentTypeChange}
      />

      {/* Basic Info Fields */}
      <BasicInfoSection form={form} />

      {/* Content Section: Excerpt and Tags */}
      <ContentSection form={form} />

      {/* Content Type Specific Fields */}
      <ContentTypeFields
        form={form}
        contentType={currentContentType}
      />

      {/* Featured Image Section */}
      <ImageSection 
        form={form}
        uploadedImage={uploadedImage}
        onImageChange={onImageChange}
      />

      {/* Content Editor Section */}
      <EditorSection 
        form={form}
        content={content}
        onContentChange={onContentChange}
        isEditing={isEditing}
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
