import React from 'react';
import BlogEditorLayout from './BlogEditorLayout';
import { useBlogForm } from '@/hooks/useBlogForm';
import { BlogPost } from '@/types/blogPost';
import { FormErrorBoundary } from '@/components/error-boundaries/FormErrorBoundary';

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  status: string;
  image_url?: string;
  slug?: string;
}

interface BlogFormProps {
  post?: BlogPost | null;
  onSubmit: (data: BlogFormData) => void;
  onCancel: () => void;
}

const BlogForm = ({ post, onSubmit, onCancel }: BlogFormProps) => {
  const {
    form,
    content,
    setContent,
    uploadedImage,
    setUploadedImage,
    autoSavedPost,
    lastSaved,
    onFormSubmit
  } = useBlogForm({ post, onSubmit });

  return (
    <FormErrorBoundary formName="Blog Editor" onReset={onCancel}>
      <div className="space-y-6">
        <BlogEditorLayout
          form={form}
          content={content}
          setContent={setContent}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          onSubmit={onFormSubmit}
          isEditing={!!post}
          onCancel={onCancel}
          autoSavedPost={autoSavedPost}
          lastSaved={lastSaved}
        />
      </div>
    </FormErrorBoundary>
  );
};

export default BlogForm;
