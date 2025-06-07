
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TiptapEditor from './TiptapEditor';
import AIContentGenerator from './AIContentGenerator';
import ImageUploader from './ImageUploader';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string | null;
  image_url?: string;
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(post?.image_url || null);
  const [content, setContent] = useState(post?.content || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const watchedValues = watch();

  const handleContentGenerated = (field: 'title' | 'excerpt' | 'content', generatedContent: string) => {
    if (field === 'content') {
      setContent(generatedContent);
      setValue('content', generatedContent);
    } else {
      setValue(field, generatedContent);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setValue('content', newContent);
  };

  const onFormSubmit = (data: any) => {
    const formData = {
      ...data,
      content,
      image_url: uploadedImage,
      tags: data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      author: 'Admin',
      slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    };
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <AIContentGenerator
        onContentGenerated={handleContentGenerated}
        currentContent={{
          title: watchedValues.title || '',
          excerpt: watchedValues.excerpt || '',
          content: content
        }}
      />

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

              <ImageUploader
                uploadedImage={uploadedImage}
                onImageChange={setUploadedImage}
              />
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
