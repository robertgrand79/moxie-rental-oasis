import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, RefreshCw, Monitor, Smartphone } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';
import { BlogPost } from '@/types/blogPost';
import BlogEditorForm from './BlogEditorForm';
import BlogPostVisualPreview from '../BlogPostVisualPreview';
import BlogAIGenerator from './ai-generator/BlogAIGenerator';
import BlogAllFieldsGenerator from './ai-generator/BlogAllFieldsGenerator';
import { ensureHTMLParagraphs } from '@/utils/contentFormatting';
import { useBlogAIGeneration } from './ai-generator/useBlogAIGeneration';

interface BlogEditorWithPreviewProps {
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

const BlogEditorWithPreview = ({
  form,
  content,
  setContent,
  uploadedImage,
  setUploadedImage,
  onSubmit,
  isEditing,
  onCancel,
  autoSavedPost,
  lastSaved
}: BlogEditorWithPreviewProps) => {
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('editor');

  const watchedValues = form.watch();

  // AI Generation hook for the complete blog post generator
  const {
    isGeneratingAll,
    generationProgress,
    generateAllFields
  } = useBlogAIGeneration({
    currentTitle: watchedValues.title || '',
    currentExcerpt: watchedValues.excerpt || '',
    currentContent: content,
    onContentGenerated: handleAIContentGenerated
  });

  const handlePreviewSync = () => {
    // Force re-render of preview by updating a timestamp
    setContent(content + '');
  };

  function handleAIContentGenerated(field: 'title' | 'excerpt' | 'content' | 'tags', generatedContent: string) {
    if (field === 'title') {
      form.setValue('title', generatedContent);
    } else if (field === 'excerpt') {
      form.setValue('excerpt', generatedContent);
    } else if (field === 'content') {
      // Convert plain text with line breaks to proper HTML paragraphs
      const formattedContent = ensureHTMLParagraphs(generatedContent);
      setContent(formattedContent);
      form.setValue('content', formattedContent);
    } else if (field === 'tags') {
      form.setValue('tags', generatedContent);
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="space-y-6">
      {/* Editor Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Blog Editor</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              {showPreview && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewSync}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Preview
                  </Button>
                  <div className="flex gap-1 border rounded-md">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
              {/* Auto-save indicator */}
              {lastSaved && (
                <div className="text-xs text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Editor Layout */}
      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* Editor Panel */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor">
              <div className="space-y-6">
                {/* Complete Blog Post Generator - Always visible at top when in editor mode */}
                <BlogAllFieldsGenerator
                  onGenerateAllFields={generateAllFields}
                  isGeneratingAll={isGeneratingAll}
                  generationProgress={generationProgress}
                />

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
              </div>
            </TabsContent>

            <TabsContent value="ai-assistant">
              <BlogAIGenerator
                currentTitle={watchedValues.title || ''}
                currentExcerpt={watchedValues.excerpt || ''}
                currentContent={content}
                onContentGenerated={handleAIContentGenerated}
              />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Blog Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Live Preview</h4>
                    <p className="text-sm text-blue-700">
                      The preview automatically updates as you type. Use the sync button to force refresh if needed.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Auto-save</h4>
                    <p className="text-sm text-green-700">
                      Your work is automatically saved as you type. You can continue editing anytime.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">AI Assistant</h4>
                    <p className="text-sm text-purple-700">
                      Use the AI Assistant tab to generate content, improve your writing, and get suggestions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="sticky top-4">
            <BlogPostVisualPreview
              title={watchedValues.title || 'Untitled Post'}
              content={content || '<p>Start writing to see your preview...</p>'}
              excerpt={watchedValues.excerpt || ''}
              imageUrl={uploadedImage}
              tags={watchedValues.tags ? watchedValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []}
              author="Admin"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditorWithPreview;