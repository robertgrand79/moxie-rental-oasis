
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import BlogEditorForm from './BlogEditorForm';
import BlogPostVisualPreview from '../BlogPostVisualPreview';
import BlogAIGenerator from '../blog/ai-generator/BlogAIGenerator';
import BlogAllFieldsGenerator from './ai-generator/BlogAllFieldsGenerator';
import { ensureHTMLParagraphs } from '@/utils/contentFormatting';
import { useBlogAIGeneration } from './ai-generator/useBlogAIGeneration';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
  author: string;
  published_at: Date | null;
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

  // AI Generation hook for the complete blog post generator
  const {
    isGeneratingAll,
    generationProgress,
    generateAllFields
  } = useBlogAIGeneration({
    currentTitle: watchedValues.title || '',
    currentExcerpt: watchedValues.excerpt || '',
    currentContent: content,
    onContentGenerated: onAIContentGenerated
  });

  const handleContentChange = (newContent: string) => {
    console.log('📝 Content changed in BlogEditorContent:', newContent.substring(0, 100));
    setContent(newContent);
  };

  const handleAIContentGenerated = (field: 'title' | 'excerpt' | 'content', generatedContent: string) => {
    if (field === 'content') {
      // Convert plain text with line breaks to proper HTML paragraphs with double spacing
      const formattedContent = ensureHTMLParagraphs(generatedContent);
      console.log('🤖 AI generated content formatted:', formattedContent.substring(0, 100));
      setContent(formattedContent);
      form.setValue('content', formattedContent);
    } else {
      // For title and excerpt, pass through as-is
      onAIContentGenerated(field, generatedContent);
    }
  };

  return (
    <div className="space-y-6">
      {/* Complete Blog Post Generator - Always visible at top when in editor mode */}
      {viewMode === 'editor' && (
        <BlogAllFieldsGenerator
          onGenerateAllFields={generateAllFields}
          isGeneratingAll={isGeneratingAll}
          generationProgress={generationProgress}
        />
      )}

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
          
          {/* Live Preview below editor when in editor mode */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground prose-code:text-foreground"
                dangerouslySetInnerHTML={{ __html: content || '<p>Start typing to see your content preview...</p>' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Assistant Panel */}
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
        <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground prose-code:text-foreground"
            dangerouslySetInnerHTML={{ __html: content || '<p>No content to preview yet...</p>' }}
          />
        </div>
      )}
    </div>
  );
};

export default BlogEditorContent;
