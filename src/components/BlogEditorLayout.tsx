
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Eye, Wand2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import TiptapEditor from './TiptapEditor';
import ImageUploader from './ImageUploader';
import BlogPostVisualPreview from './BlogPostVisualPreview';
import BlogAIGenerator from './blog/ai-generator/BlogAIGenerator';

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

  const watchedValues = form.watch();
  const tagsArray = watchedValues.tags ? 
    watchedValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
    [];

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    form.setValue('content', newContent);
  };

  const handleAIContentGenerated = (field: 'title' | 'excerpt' | 'content', generatedContent: string) => {
    if (field === 'title') {
      form.setValue('title', generatedContent);
    } else if (field === 'excerpt') {
      form.setValue('excerpt', generatedContent);
    } else if (field === 'content') {
      setContent(generatedContent);
      form.setValue('content', generatedContent);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Blog Post Editor</CardTitle>
            <CardDescription>
              Create and preview your blog post with our visual editor and AI assistance
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('editor')}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Editor
            </Button>
            <Button
              variant={viewMode === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('ai')}
            >
              <Wand2 className="h-4 w-4 mr-1" />
              AI Generator
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Editor Panel */}
          {viewMode === 'editor' && (
            <div className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter blog post title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the blog post"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter tags separated by commas"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ImageUploader
                    uploadedImage={uploadedImage}
                    onImageChange={setUploadedImage}
                  />

                  <div>
                    <FormLabel>Content</FormLabel>
                    <div className="mt-2">
                      <TiptapEditor
                        content={content}
                        onChange={handleContentChange}
                        placeholder="Write your blog post content here..."
                        className="min-h-[400px]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1">
                      {isEditing ? 'Update Post' : 'Create Post'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
              
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
      </CardContent>
    </Card>
  );
};

export default BlogEditorLayout;
