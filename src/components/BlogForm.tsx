
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import BlogEditorLayout from './BlogEditorLayout';
import { useAutoSave } from '@/hooks/useAutoSave';
import { BlogPost } from '@/types/blogPost';

interface BlogFormProps {
  post?: BlogPost | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const BlogForm = ({ post, onSubmit, onCancel }: BlogFormProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(post?.image_url || null);
  const [content, setContent] = useState(post?.content || '');
  const [autoSavedPost, setAutoSavedPost] = useState<BlogPost | null>(post || null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm({
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      tags: post?.tags?.join(', ') || '',
      status: post?.status || 'draft'
    }
  });

  const watchedValues = form.watch();

  // Auto-save functionality
  const { autoSave } = useAutoSave({
    data: {
      title: watchedValues.title,
      excerpt: watchedValues.excerpt,
      content: content,
      tags: watchedValues.tags
    },
    postId: autoSavedPost?.id,
    onAutoSave: (savedPost) => {
      setAutoSavedPost(savedPost);
      setLastSaved(new Date());
    },
    delay: 3000
  });

  // Update content in form when it changes
  useEffect(() => {
    form.setValue('content', content);
  }, [content, form]);

  const onFormSubmit = (data: any) => {
    const formData = {
      ...data,
      content,
      image_url: uploadedImage,
      tags: data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      author: 'Admin',
      slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    };

    // If we have an auto-saved post, update it instead of creating new
    if (autoSavedPost && !post) {
      formData.id = autoSavedPost.id;
    }

    onSubmit(formData);
  };

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasContent = watchedValues.title || watchedValues.excerpt || content || watchedValues.tags;
      if (hasContent && !lastSaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [watchedValues, content, lastSaved]);

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
