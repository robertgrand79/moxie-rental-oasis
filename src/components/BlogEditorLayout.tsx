import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import BlogEditorHeader from './blog/BlogEditorHeader';
import BlogEditorContent from './blog/BlogEditorContent';
import { ensureHTMLParagraphs } from '@/utils/contentFormatting';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
}

interface BlogEditorLayoutProps {
  form: UseFormReturn<BlogFormData>;
  content: string;
  setContent: (content: string) => void;
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  onSubmit: (data: BlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const BlogEditorLayout = ({
  form,
  content,
  setContent,
  uploadedImage,
  setUploadedImage,
  onSubmit,
  isEditing,
  onCancel
}: BlogEditorLayoutProps) => {
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'ai'>('editor');

  const handleAIContentGenerated = (field: 'title' | 'excerpt' | 'content', generatedContent: string) => {
    if (field === 'title') {
      form.setValue('title', generatedContent);
    } else if (field === 'excerpt') {
      form.setValue('excerpt', generatedContent);
    } else if (field === 'content') {
      // Convert plain text with line breaks to proper HTML paragraphs
      const formattedContent = ensureHTMLParagraphs(generatedContent);
      setContent(formattedContent);
      form.setValue('content', formattedContent);
    }
  };

  return (
    <Card>
      <CardHeader>
        <BlogEditorHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </CardHeader>
      <CardContent>
        <BlogEditorContent
          viewMode={viewMode}
          form={form}
          content={content}
          setContent={setContent}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          onSubmit={onSubmit}
          isEditing={isEditing}
          onCancel={onCancel}
          onAIContentGenerated={handleAIContentGenerated}
        />
      </CardContent>
    </Card>
  );
};

export default BlogEditorLayout;
