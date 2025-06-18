import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import BlogEditorForm from './BlogEditorForm';
import BlogPostVisualPreview from '../BlogPostVisualPreview';
import BlogAIGenerator from '../blog/ai-generator/BlogAIGenerator';
import { ensureHTMLParagraphs } from '@/utils/contentFormatting';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
}

interface BlogEditorContentProps {
  viewMode: 'editor' | 'preview' | 'ai';
  form: UseFormReturn<BlogFormData>;
  content: string;
  setContent: (content: string) => void;
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  onSubmit: (data: BlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
  onAIContentGenerated: (field: 'title' | 'excerpt' | 'content', generatedContent: string) => void;
}

const BlogEditorContent = ({
  viewMode,
  form,
  content,
  setContent,
  uploadedImage,
  setUploadedImage,
  onSubmit,
  isEditing,
  onCancel,
  onAIContentGenerated
}: BlogEditorContentProps) => {
  const watchedValues = form.watch();
  const tagsArray = watchedValues.tags ? 
    watchedValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
    [];

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    form.setValue('content', newContent);
  };

  const handleAIContentGenerated = (field: 'title' | 'excerpt' | 'content', generatedContent: string) => {
    if (field === 'content') {
      // Convert plain text with line breaks to proper HTML paragraphs
      const formattedContent = ensureHTMLParagraphs(generatedContent);
      setContent(formattedContent);
      form.setValue('content', formattedContent);
    } else {
      // For title and excerpt, pass through as-is
      onAIContentGenerated(field, generatedContent);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Panel */}
      {viewMode === 'editor' && (
        <div className="space-y-6">
          <BlogEditorForm
            form={form}
            content={content}
            onContentChange={handleContentChange}
            uploadedImage={uploadedImage}
            onImageChange={setUploadedImage}
            onSubmit={onSubmit}
            isEditing={isEditing}
            onCancel={onCancel}
          />
          
          {/* Preview below editor when in editor mode */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <BlogPostVisualPreview
              title={watchedValues.title || ''}
              excerpt={watchedValues.excerpt || ''}
              content={content}
              author="Admin"
              tags={tagsArray}
              imageUrl={uploadedImage || undefined}
            />
          </div>
        </div>
      )}

      {/* AI Generator Panel */}
      {viewMode === 'ai' && (
        <div>
          <BlogAIGenerator
            currentTitle={watchedValues.title || ''}
            currentExcerpt={watchedValues.excerpt || ''}
            currentContent={content}
            onContentGenerated={handleAIContentGenerated}
          />
        </div>
      )}

      {/* Preview Panel */}
      {viewMode === 'preview' && (
        <div>
          <BlogPostVisualPreview
            title={watchedValues.title || ''}
            excerpt={watchedValues.excerpt || ''}
            content={content}
            author="Admin"
            tags={tagsArray}
            imageUrl={uploadedImage || undefined}
          />
        </div>
      )}
    </div>
  );
};

export default BlogEditorContent;
