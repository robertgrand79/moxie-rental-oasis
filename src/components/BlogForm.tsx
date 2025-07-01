
import React from 'react';
import BlogEditorLayout from './BlogEditorLayout';
import { useBlogForm } from '@/hooks/useBlogForm';
import { BlogPost } from '@/types/blogPost';

interface BlogFormProps {
  post?: BlogPost | null;
  onSubmit: (data: any) => void;
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
  );
};

export default BlogForm;
