
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import BlogEditorLayout from './BlogEditorLayout';
import { useAutoSave } from '@/hooks/useAutoSave';
import { BlogPost, ContentType } from '@/types/blogPost';

interface BlogFormProps {
  post?: BlogPost | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// Extended form data interface to include all content type fields
interface ExtendedBlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
  author: string;
  published_at: Date | null;
  image_credit: string;
  // Content type fields
  content_type: ContentType;
  category: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  // Location fields
  location: string;
  latitude?: number;
  longitude?: number;
  address: string;
  // Event-specific fields
  event_date?: Date | null;
  end_date?: Date | null;
  time_start: string;
  time_end: string;
  ticket_url: string;
  price_range: string;
  is_recurring: boolean;
  recurrence_pattern: string;
  // POI-specific fields
  rating?: number;
  phone: string;
  website_url: string;
  // Lifestyle-specific fields
  activity_type: string;
}

const BlogForm = ({ post, onSubmit, onCancel }: BlogFormProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(post?.image_url || null);
  const [content, setContent] = useState(post?.content || '');
  const [autoSavedPost, setAutoSavedPost] = useState<BlogPost | null>(post || null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<ExtendedBlogFormData>({
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      tags: post?.tags?.join(', ') || '',
      status: post?.status || 'draft',
      author: post?.author || 'Moxie Team',
      published_at: post?.published_at ? new Date(post.published_at) : null,
      image_credit: post?.image_credit || '',
      // Content type defaults
      content_type: post?.content_type || 'article',
      category: post?.category || '',
      display_order: post?.display_order || 0,
      is_featured: post?.is_featured || false,
      is_active: post?.is_active !== false,
      // Location defaults
      location: post?.location || '',
      latitude: post?.latitude || undefined,
      longitude: post?.longitude || undefined,
      address: post?.address || '',
      // Event defaults
      event_date: post?.event_date ? new Date(post.event_date) : null,
      end_date: post?.end_date ? new Date(post.end_date) : null,
      time_start: post?.time_start || '',
      time_end: post?.time_end || '',
      ticket_url: post?.ticket_url || '',
      price_range: post?.price_range || '',
      is_recurring: post?.is_recurring || false,
      recurrence_pattern: post?.recurrence_pattern || '',
      // POI defaults
      rating: post?.rating || undefined,
      phone: post?.phone || '',
      website_url: post?.website_url || '',
      // Lifestyle defaults
      activity_type: post?.activity_type || ''
    }
  });

  const watchedValues = form.watch();

  // Auto-save functionality with extended data
  const { autoSave } = useAutoSave({
    data: {
      title: watchedValues.title,
      excerpt: watchedValues.excerpt,
      content: content,
      tags: watchedValues.tags,
      author: watchedValues.author,
      image_url: uploadedImage || undefined,
      image_credit: watchedValues.image_credit || undefined
    },
    postId: autoSavedPost?.id,
    onAutoSave: (savedPost) => {
      console.log('💾 Auto-saved post:', savedPost);
      setAutoSavedPost(savedPost);
      setLastSaved(new Date());
    },
    delay: 3000
  });

  // Update content in form when it changes
  useEffect(() => {
    console.log('📝 BlogForm content updated:', content);
    form.setValue('content', content, { shouldValidate: false });
  }, [content, form]);

  const onFormSubmit = (data: ExtendedBlogFormData) => {
    console.log('📨 Blog form submitted:', data);
    console.log('📨 Image credit being submitted:', data.image_credit);
    
    // Ensure we have a valid author
    const finalAuthor = data.author && data.author.trim() ? data.author.trim() : 'Moxie Team';
    
    const formData = {
      ...data,
      content,
      image_url: uploadedImage,
      image_credit: data.image_credit || null,
      tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
      author: finalAuthor,
      published_at: data.published_at ? data.published_at.toISOString() : null,
      slug: data.title ? data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'untitled',
      // Content type specific data
      content_type: data.content_type,
      category: data.category || null,
      display_order: data.display_order,
      is_featured: data.is_featured,
      is_active: data.is_active,
      // Location data
      location: data.location || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      address: data.address || null,
      // Event data
      event_date: data.event_date ? data.event_date.toISOString().split('T')[0] : null,
      end_date: data.end_date ? data.end_date.toISOString().split('T')[0] : null,
      time_start: data.time_start || null,
      time_end: data.time_end || null,
      ticket_url: data.ticket_url || null,
      price_range: data.price_range || null,
      is_recurring: data.is_recurring,
      recurrence_pattern: data.recurrence_pattern || null,
      // POI data
      rating: data.rating || null,
      phone: data.phone || null,
      website_url: data.website_url || null,
      // Lifestyle data
      activity_type: data.activity_type || null,
      // Metadata based on content type
      metadata: {}
    };

    // If we have an auto-saved post, update it instead of creating new
    if (autoSavedPost && !post) {
      formData.id = autoSavedPost.id;
    } else if (post) {
      formData.id = post.id;
    }

    console.log('📨 Final form data being submitted:', formData);
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
