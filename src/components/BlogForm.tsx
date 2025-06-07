import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Wand2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TiptapEditor from './TiptapEditor';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  slug: string;
  status: 'draft' | 'published';
}

interface BlogFormProps {
  post?: BlogPost | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const BlogForm = ({ post, onSubmit, onCancel }: BlogFormProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(post?.imageUrl || null);
  const [content, setContent] = useState(post?.content || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedField, setSelectedField] = useState<'title' | 'excerpt' | 'content'>('title');
  const [generatedContent, setGeneratedContent] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      tags: post?.tags?.join(', ') || '',
      status: post?.status || 'draft'
    }
  });

  const generateContent = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: aiPrompt,
          context: {
            businessType: 'vacation rental blog',
            currentContent: {
              siteName: 'Moxie Vacation Rentals',
              title: post?.title || '',
              excerpt: post?.excerpt || '',
              content: post?.content || ''
            },
            field: selectedField
          }
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      toast({
        title: "Content Generated!",
        description: "AI has generated new content based on your prompt.",
      });
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyGeneratedContent = () => {
    if (!generatedContent) return;

    if (selectedField === 'content') {
      setContent(generatedContent);
      setValue('content', generatedContent);
    } else {
      setValue(selectedField, generatedContent);
    }

    toast({
      title: "Content Applied",
      description: `Updated ${selectedField}.`,
    });

    setGeneratedContent('');
    setAiPrompt('');
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setValue('content', newContent);
  };

  const onFormSubmit = (data: any) => {
    const formData = {
      ...data,
      content,
      imageUrl: uploadedImage,
      tags: data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
    };
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* AI Content Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate blog content with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Content Field to Generate</Label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value as 'title' | 'excerpt' | 'content')}
              className="w-full p-2 border rounded-md mt-1"
            >
              <option value="title">Title</option>
              <option value="excerpt">Excerpt</option>
              <option value="content">Content</option>
            </select>
          </div>

          <div>
            <Label htmlFor="aiPrompt">AI Prompt</Label>
            <Textarea
              id="aiPrompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe what kind of content you want AI to generate..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={generateContent} 
            disabled={isGenerating || !aiPrompt.trim()}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>

          {generatedContent && (
            <div className="space-y-4">
              <div>
                <Label>Generated Content</Label>
                <div className="mt-1 p-4 border rounded-md bg-gray-50">
                  <p className="whitespace-pre-wrap">{generatedContent}</p>
                </div>
              </div>
              
              <Button onClick={applyGeneratedContent} className="w-full">
                Apply to {selectedField}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Blog Form */}
      <Card>
        <CardHeader>
          <CardTitle>{post ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
          <CardDescription>
            Fill in the details below to {post ? 'update' : 'create'} your blog post
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter blog post title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    {...register('excerpt', { required: 'Excerpt is required' })}
                    placeholder="Brief description of the blog post"
                    rows={3}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-600 mt-1">{errors.excerpt.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    {...register('tags')}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    {...register('status')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Featured Image</Label>
                <div
                  className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  } ${uploadedImage ? 'border-green-500' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedImage ? (
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag and drop an image here, or
                      </p>
                      <label className="mt-2 cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">browse files</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label>Content</Label>
              <div className="mt-2">
                <TiptapEditor
                  content={content}
                  onChange={handleContentChange}
                  placeholder="Write your blog post content here..."
                  className="min-h-[400px]"
                />
                {errors.content && (
                  <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {post ? 'Update Post' : 'Create Post'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogForm;
