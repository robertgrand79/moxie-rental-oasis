
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import BlogEditorLayout from './BlogEditorLayout';

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

  const form = useForm({
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      tags: post?.tags?.join(', ') || '',
      status: post?.status || 'draft'
    }
  });

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
      <BlogEditorLayout
        form={form}
        content={content}
        setContent={setContent}
        uploadedImage={uploadedImage}
        setUploadedImage={setUploadedImage}
        onSubmit={onFormSubmit}
        isEditing={!!post}
        onCancel={onCancel}
      />
    </div>
  );
};

export default BlogForm;
