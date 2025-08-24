
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import BlogEditorWithPreview from './blog/BlogEditorWithPreview';
import { BlogPost } from '@/types/blogPost';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface BlogEditorLayoutProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  content: string;
  setContent: (content: string) => void;
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  onSubmit: (data: ExtendedBlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
  autoSavedPost?: BlogPost | null;
  lastSaved?: Date | null;
}

const BlogEditorLayout = (props: BlogEditorLayoutProps) => {
  return <BlogEditorWithPreview {...props} />;
};

export default BlogEditorLayout;
